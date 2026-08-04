"""Planted-failure fixture for the hollowness gate."""


def violation_not_implemented():
    raise NotImplementedError("compute the contingency split")   # VIOLATION


def violation_todo(matter):
    # TODO: handle flat-fee matters                             # VIOLATION
    return matter.hours * matter.rate


def violation_placeholder():
    return {"total": 0}  # placeholder until the real engine lands  # VIOLATION


def violation_for_now(rows):
    return rows[:50]  # for now, cap it                          # VIOLATION


def violation_fixme(value):
    # FIXME: rounding is wrong at the invoice level              # VIOLATION
    return round(value, 2)


def violation_hack(client):
    # HACK: retry twice because the API flakes                   # VIOLATION
    return client.get()


def clean_documented(matter):
    """Return billed hours.

    Flat-fee matters are excluded deliberately — see decision ledger entry 0007.
    """
    return matter.hours


def waived_known_gap(rows):
    # spe:allow hollowness — tracked as REQ-0142 in the deviation ledger
    # TODO: paginate once the dataset exceeds 10k rows           # CLEAN
    return rows
