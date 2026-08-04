"""Planted-failure fixture for the delete-allowlist gate.

Every VIOLATION line below must be detected. Every CLEAN line must not be.
Line positions matter — tests assert on them — so do not reorder without updating
test_gates.py.
"""


def violation_sql_delete(c, cid):
    c.execute("DELETE FROM archive_messages WHERE conversation_id=?", (cid,))   # VIOLATION


def violation_truncate(c):
    c.execute("TRUNCATE TABLE cfo_fee_facts")                                   # VIOLATION


def violation_drop_column(c):
    c.execute("ALTER TABLE matters DROP COLUMN legacy_rate")                    # VIOLATION


def violation_orm_delete(session, row):
    session.delete(row)                                                         # VIOLATION


def waived_expired_codes(conn, code):
    # spe:allow delete-allowlist — one-time OAuth codes are single-use by design
    conn.execute("DELETE FROM mcp_codes WHERE code = ?", (code,))               # CLEAN


def waived_same_line(conn, cutoff):
    conn.execute("DELETE FROM error_email_log WHERE ts < ?", (cutoff,))  # spe:allow delete-allowlist — TTL sweep on operational logs


def clean_archive_instead(conn, cid):
    """The correct pattern: mark it hidden, keep the record."""
    conn.execute("UPDATE archive_messages SET archived_at=? WHERE conversation_id=?",
                 (None, cid))                                                   # CLEAN


# A comment merely mentioning DELETE FROM must not trigger the gate.               CLEAN
def clean_mentions_only():
    return "the old importer used to DELETE FROM staging; it no longer does"     # CLEAN
