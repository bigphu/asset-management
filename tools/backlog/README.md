# backlog

Single-file Go program, standard library only. No `go get`, no `go.sum`.

```
go run ./tools/backlog                  format, validate, write docs/backlog.md
go run ./tools/backlog -check           validate only, exit 1 on error
go run ./tools/backlog -format          normalise option lines and stop
go run ./tools/backlog -format -check   report unformatted files, write nothing
go run ./tools/backlog init P-EVT-01    add a fresh occurrence block
go run ./tools/backlog adr P-EVT-01#1  scaffold an ADR for that occurrence
go run ./tools/backlog -root ..         when not run from the repo root
```

Reads `docs/guidance/P-*.md` (templates, never ticked) and
`docs/decisions/P-*.md` (ticked). Writes `docs/backlog.md`.

Option slugs are optional. Write `- [ ] **Label**` and the label is the
identity; write ``- [ ] `slug` **Label** `` and the slug is, which lets
you reword labels without breaking the decision log.

## `-format`

Rewrites option lines into canonical form and stops -- no validation, no
backlog. Like `gofmt`, it will tidy a file that currently fails
`-check`, which is the point: fix the shape first, then the content.

With `-check` it becomes `gofmt -l`: lists the files that would change,
writes nothing, exits 1. Wire that into CI, or wire plain `-format` into
a pre-commit hook or an editor format-on-save.

A default run still formats before it writes the backlog, so `-format`
is only needed when you want formatting *without* everything else.

## `adr <occurrence-id> [title]`

Writes `docs/decisions/adr/NNNN-slug.md` with the next free number, and
writes the number back into the occurrence block so both halves of the
link exist from the start.

Pre-filled from what the checkboxes already say: Kruchten's `state`
(a `[~]` option yields `tentative`, a `[!]` yields `challenged`), and
the chosen and neglected option labels spliced into the Y-statement.
Everything else is a `TODO` and `-check` fails until each is replaced --
a half-written ADR does not pass CI.

Refuses an occurrence that is still `open`, and refuses one that already
points at an ADR. The title defaults to the chosen option; pass one to
override.

If there is no `go.mod` yet: `go mod init <module-name>`.