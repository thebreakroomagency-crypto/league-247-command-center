"""Google Sheets sync service — The Breakroom 247 Command Center."""
import os
import re
from typing import Any
from google.oauth2.service_account import Credentials
from google.auth.transport.requests import Request
import urllib.request
import json

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
]

SPREADSHEET_ID = os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID', '11BjpZuhEl8FinjKNAoaJ5HXn0TGnCxXqzya2Lj_o8tw')
CREDS_FILE = os.getenv('GOOGLE_CREDENTIALS_FILE', 'google-credentials.json')

# ── Tab names ──────────────────────────────────────────────────
TABS = {
    'clients':        'Clients',
    'tasks':          'Tasks',
    'revenue':        'Revenue Tracker',
    'riley':          'Riley Stone Content',
    'production':     'Production Queue',
    'sales_pipeline': 'Sales Pipeline',
    'agent_logs':     'Agent Logs',
}


def _get_creds() -> Credentials:
    # Production: read creds from GOOGLE_CREDENTIALS_JSON env var (base64 or raw JSON)
    creds_json_env = os.getenv('GOOGLE_CREDENTIALS_JSON', '')
    if creds_json_env:
        import base64
        try:
            info = json.loads(base64.b64decode(creds_json_env).decode())
        except Exception:
            info = json.loads(creds_json_env)
        creds = Credentials.from_service_account_info(info, scopes=SCOPES)
    else:
        creds_path = os.path.join(os.path.dirname(__file__), '..', '..', CREDS_FILE)
        creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
    if not creds.valid:
        creds.refresh(Request())
    return creds


def _fetch_tab(tab_name: str) -> list[list[str]]:
    creds = _get_creds()
    if not creds.token:
        creds.refresh(Request())
    encoded = tab_name.replace(' ', '%20')
    url = f'https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{encoded}'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {creds.token}'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read()).get('values', [])


def _parse(rows: list[list[str]]) -> list[dict[str, str]]:
    """Convert rows to list of dicts using first row as headers."""
    if len(rows) < 2:
        return []
    headers = [h.strip() for h in rows[0]]
    result = []
    for row in rows[1:]:
        row_padded = row + [''] * (len(headers) - len(row))
        result.append({headers[i]: row_padded[i] for i in range(len(headers))})
    return result


def _parse_money(val: str) -> float:
    return float(re.sub(r'[^0-9.]', '', val or '0') or 0)


# ── Public sync functions ──────────────────────────────────────

def get_clients() -> list[dict[str, Any]]:
    rows = _fetch_tab(TABS['clients'])
    records = _parse(rows)
    result = []
    for r in records:
        if not r.get('Client Name'):
            continue
        result.append({
            'id': r.get('Client Name', '').lower().replace(' ', '-'),
            'name': r.get('Main Contact', r.get('Client Name', '')),
            'company': r.get('Client Name', ''),
            'status': _client_status(r.get('Status', 'Active')),
            'monthlyValue': _parse_money(r.get('Monthly Value', '0')),
            'oneTimeValue': _parse_money(r.get('One-Time Value', '0')),
            'nextAction': r.get('Notes', ''),
            'assignedAgent': r.get('Assigned Agent', 'OG'),
            'lastContact': r.get('Last Contact Date', ''),
            'nextFollowUp': r.get('Next Follow-Up Date', ''),
            'campaign': r.get('Current Campaign', ''),
            'industry': r.get('Industry', ''),
            'source': 'sheets',
        })
    return result


def get_tasks() -> list[dict[str, Any]]:
    rows = _fetch_tab(TABS['tasks'])
    records = _parse(rows)
    result = []
    for i, r in enumerate(records):
        if not r.get('Task Name'):
            continue
        result.append({
            'id': f'sheet-task-{i}',
            'title': r.get('Task Name', ''),
            'description': r.get('Description', ''),
            'agent': r.get('Assigned Agent', 'OG').split('/')[0].strip(),
            'priority': _priority(r.get('Priority', 'Medium')),
            'status': _task_status(r.get('Status', 'Open')),
            'dueDate': r.get('Due Date', ''),
            'category': _category(r.get('Category', 'ops')),
            'client': r.get('Related Client / Brand', ''),
            'assignedTo': r.get('Assigned To', ''),
            'notes': r.get('Notes', ''),
            'source': 'sheets',
        })
    return result


def get_production_queue() -> list[dict[str, Any]]:
    rows = _fetch_tab(TABS['production'])
    records = _parse(rows)
    result = []
    for i, r in enumerate(records):
        if not r.get('Project Name'):
            continue
        # Derive overall status from the edit/export stages
        edit = r.get('Edit Status', 'Not Started')
        export = r.get('Final Export Status', 'Not Started')
        if export == 'Complete':
            status = 'completed'
        elif edit == 'In Progress':
            status = 'in_progress'
        elif r.get('Script Status') == 'In Progress' or r.get('Prompt Status') == 'In Progress':
            status = 'in_progress'
        else:
            status = 'pending'

        result.append({
            'id': f'prod-{i}',
            'title': r.get('Project Name', ''),
            'agent': r.get('Assigned Agent', 'CUTTY').split('/')[0].strip(),
            'priority': _priority(r.get('Priority', 'High')),
            'status': status,
            'dueDate': r.get('Due Date', ''),
            'category': 'content',
            'client': r.get('Client / Brand', ''),
            'assetType': r.get('Asset Type', ''),
            'tool': r.get('Tool Needed', ''),
            'stages': {
                'script': r.get('Script Status', ''),
                'prompt': r.get('Prompt Status', ''),
                'voiceover': r.get('Voiceover Status', ''),
                'edit': r.get('Edit Status', ''),
                'export': r.get('Final Export Status', ''),
            },
            'notes': r.get('Notes', ''),
            'source': 'sheets',
        })
    return result


def get_revenue() -> dict[str, Any]:
    rows = _fetch_tab(TABS['revenue'])
    records = _parse(rows)
    total_mrr = 0.0
    total_onetime = 0.0
    unpaid_count = 0
    upsell_opps = []
    clients_data = []

    for r in records:
        if not r.get('Client / Source'):
            continue
        mrr = _parse_money(r.get('Monthly Value', '0'))
        ot = _parse_money(r.get('One-Time Value', '0'))
        total_mrr += mrr
        total_onetime += ot
        if r.get('Invoice Status', '').lower() == 'unpaid':
            unpaid_count += 1
        if r.get('Upsell Opportunity'):
            upsell_opps.append({
                'client': r.get('Client / Source'),
                'opportunity': r.get('Upsell Opportunity'),
                'risk': r.get('Risk Level', 'Low'),
            })
        clients_data.append({
            'name': r.get('Client / Source'),
            'mrr': mrr,
            'oneTime': ot,
            'status': r.get('Invoice Status', ''),
            'package': r.get('Package', ''),
            'risk': r.get('Risk Level', 'Low'),
        })

    return {
        'currentMRR': total_mrr,
        'mrrTarget': 20000.0,
        'mrrGrowth': 18.4,
        'totalClients': len(clients_data),
        'avgDealSize': total_mrr / len(clients_data) if clients_data else 0,
        'pipeline': 17200.0,
        'unpaidInvoices': unpaid_count,
        'upsellOpportunities': upsell_opps,
        'clientBreakdown': clients_data,
        'source': 'sheets',
        'history': [
            {'month': 'Jan', 'mrr': 7200,  'newRevenue': 1200, 'target': 10000, 'churn': 0},
            {'month': 'Feb', 'mrr': 8400,  'newRevenue': 1800, 'target': 11000, 'churn': 600},
            {'month': 'Mar', 'mrr': 9800,  'newRevenue': 2200, 'target': 12000, 'churn': 800},
            {'month': 'Apr', 'mrr': 11200, 'newRevenue': 2800, 'target': 13000, 'churn': 1400},
            {'month': 'May', 'mrr': 12500, 'newRevenue': 3200, 'target': 15000, 'churn': 1900},
            {'month': 'Jun', 'mrr': total_mrr, 'newRevenue': 5000, 'target': 20000, 'churn': 2700},
        ],
    }


def get_riley_content() -> list[dict[str, Any]]:
    rows = _fetch_tab(TABS['riley'])
    records = _parse(rows)
    result = []
    for i, r in enumerate(records):
        if not r.get('Content Title'):
            continue
        result.append({
            'id': f'riley-{i}',
            'title': r.get('Content Title', ''),
            'platform': r.get('Platform', 'Instagram'),
            'type': _content_type(r.get('Format', 'Post')),
            'status': _content_status(r.get('Status', 'In Queue')),
            'scheduledDate': f"{r.get('Post Date', '')} {r.get('Post Time', '')}".strip(),
            'pillar': r.get('Content Pillar', ''),
            'caption': r.get('Caption', ''),
            'cta': r.get('CTA', ''),
            'outfit': r.get('Outfit', ''),
            'notes': r.get('Notes', ''),
            'performance': r.get('Performance', ''),
            'source': 'sheets',
        })
    return result


# ── Helpers ────────────────────────────────────────────────────

def _client_status(s: str) -> str:
    s = s.lower()
    if 'active' in s:    return 'active'
    if 'risk' in s:      return 'at_risk'
    if 'prospect' in s:  return 'prospect'
    if 'churn' in s:     return 'churned'
    return 'active'

def _priority(p: str) -> str:
    p = p.lower()
    if 'critical' in p or 'urgent' in p: return 'critical'
    if 'high' in p:   return 'high'
    if 'medium' in p or 'med' in p: return 'medium'
    return 'low'

def _task_status(s: str) -> str:
    s = s.lower()
    if 'complete' in s or 'done' in s: return 'completed'
    if 'progress' in s:  return 'in_progress'
    if 'review' in s:    return 'review'
    if 'block' in s:     return 'blocked'
    return 'pending'

def _category(c: str) -> str:
    c = c.lower()
    if 'client' in c or 'delivery' in c: return 'client'
    if 'sales' in c:     return 'sales'
    if 'content' in c:   return 'content'
    if 'market' in c:    return 'marketing'
    if 'dev' in c or 'tech' in c: return 'development'
    if 'finance' in c or 'billing' in c: return 'ops'
    return 'ops'

def _content_type(f: str) -> str:
    f = f.lower()
    if 'reel' in f:   return 'Reel'
    if 'video' in f or 'grwm' in f: return 'Video'
    if 'story' in f:  return 'Story'
    if 'thread' in f: return 'Thread'
    return 'Post'

def _content_status(s: str) -> str:
    s = s.lower()
    if 'publish' in s or 'live' in s: return 'published'
    if 'schedul' in s:  return 'scheduled'
    if 'review' in s:   return 'review'
    if 'edit' in s:     return 'editing'
    if 'record' in s:   return 'recording'
    if 'script' in s:   return 'scripting'
    if 'queue' in s:    return 'scheduled'
    return 'idea'
