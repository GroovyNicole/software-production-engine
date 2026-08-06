"""Deliberate violation, pushed to prove the merge lock actually blocks.

Contains a hard delete of collected data, which decision 0001 forbids and the
delete-allowlist gate catches. This file exists only to make a pull request fail
its checks. It is deleted immediately after the demonstration.
"""


def wipe_everything(conn):
    conn.execute("DELETE FROM matters")
