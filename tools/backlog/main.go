// Command backlog derives the decision backlog from the guidance model
// and the ticked decision files, and checks the two against each other.
//
//	go run ./tools/backlog                  write docs/backlog.md
//	go run ./tools/backlog -check           validate only, exit 1 on error
//	go run ./tools/backlog init P-EVT-01    append a fresh block to the
//	                                        matching decision file
//
// Standard library only. No go.sum, nothing to install.
//
// Option state is carried by the checkbox mark:
//
//	[ ] eligible   [x] chosen   [~] tentative   [-] neglected   [!] challenged
//
// Guidance files are templates and must stay entirely unticked. Project
// state lives in docs/decisions/ only.
package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"
)

// ---------- model ----------

type Option struct {
	Key   string // slug if present, otherwise the label
	Label string
	State string // eligible | chosen | tentative | neglected | challenged
}

type Block struct {
	ID      string // P-EXP-01 for a problem, P-EXP-01#1 for an occurrence
	Problem string // occurrences only
	Title   string
	Fields  map[string]string
	Options []Option
	File    string
	Line    int
}

var (
	levels           = []string{"Executive", "Conceptual", "Technology", "Vendor/Asset"}
	guidanceFields   = []string{"Level", "Viewpoint", "Options", "Raises", "Bound to", "Trigger", "Refs", "Note", "Known hazard", "Select"}
	occurrenceFields = []string{"Options", "Trigger", "ADR", "Sprint", "Note"}
)

// ---------- parsing ----------

var (
	problemRe  = regexp.MustCompile(`^###\s+(P-[A-Z]+-\d+)\s*[-–—]\s*\*?(.*?)\*?\s*$`)
	occRe      = regexp.MustCompile(`^###\s+((P-[A-Z]+-\d+)#\d+)\s*[-–—]\s*\*?(.*?)\*?\s*$`)
	fieldRe    = regexp.MustCompile(`^\s*-\s+\*\*([A-Za-z ]+):\*\*\s*(.*?)\s*$`)
	noColonRe  = regexp.MustCompile(`^\s*-\s+\*\*([A-Za-z ]+)\*\*\s+\S`)
	optionRe   = regexp.MustCompile(`^(\s*)-\s+\[([ x~!-])\]\s+(.+?)(\s*)$`)
	slugRe     = regexp.MustCompile("^`([a-z0-9-]+)`\\s+(.*)$")
	positional = regexp.MustCompile(`(?i)\boption\s*\d`)
	problemRef = regexp.MustCompile(`P-[A-Z]+-\d+`)
)

func readFile(path string, isOcc bool, errs *[]string) ([]*Block, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	base := filepath.Base(path)
	allowed := guidanceFields
	if isOcc {
		allowed = occurrenceFields
	}

	var out []*Block
	var cur *Block
	for i, line := range strings.Split(string(data), "\n") {
		re := problemRe
		if isOcc {
			re = occRe
		}
		if m := re.FindStringSubmatch(line); m != nil {
			cur = &Block{Fields: map[string]string{}, File: base, Line: i + 1}
			if isOcc {
				cur.ID, cur.Problem, cur.Title = m[1], m[2], strings.TrimSpace(m[3])
			} else {
				cur.ID, cur.Title = m[1], strings.TrimSpace(m[2])
			}
			out = append(out, cur)
			continue
		}
		if cur == nil {
			continue
		}
		if _, slug, label, st, _, ok := parseOptionLine(line); ok {
			key := slug
			if key == "" {
				key = label
			}
			cur.Options = append(cur.Options, Option{Key: key, Label: label, State: st})
			continue
		}
		if m := fieldRe.FindStringSubmatch(line); m != nil {
			key := strings.TrimSpace(m[1])
			if !contains(allowed, key) {
				*errs = append(*errs, fmt.Sprintf("%s:%d: unknown field **%s:** (typo?)", base, i+1, key))
			}
			cur.Fields[key] = strings.TrimSpace(m[2])
			continue
		}
		if noColonRe.MatchString(line) {
			*errs = append(*errs, fmt.Sprintf("%s:%d: field bullet missing its colon — %s",
				base, i+1, strings.TrimSpace(line)))
		}
	}
	return out, nil
}

func load(root string, errs *[]string) (map[string]*Block, []*Block, error) {
	problems := map[string]*Block{}
	names, _ := filepath.Glob(filepath.Join(root, "docs", "guidance", "P-*.md"))
	if len(names) == 0 {
		return nil, nil, fmt.Errorf("no guidance files found under %s/docs/guidance", root)
	}
	for _, n := range names {
		blocks, err := readFile(n, false, errs)
		if err != nil {
			return nil, nil, err
		}
		for _, p := range blocks {
			if prev, dup := problems[p.ID]; dup {
				*errs = append(*errs, fmt.Sprintf("%s: defined in both %s and %s", p.ID, prev.File, p.File))
			}
			problems[p.ID] = p
		}
	}
	var log []*Block
	names, _ = filepath.Glob(filepath.Join(root, "docs", "decisions", "P-*.md"))
	for _, n := range names {
		blocks, err := readFile(n, true, errs)
		if err != nil {
			return nil, nil, err
		}
		log = append(log, blocks...)
	}
	return problems, log, nil
}

// ---------- option lines: terse input, canonical output ----------

// parseOptionLine accepts both the terse editing form, where the state
// lives in the checkbox ([~] [-] [!]), and the canonical rendered form,
// where it is carried by GFM-safe decoration. Files therefore round-trip:
// type the terse form in an editor, run the tool, get the rendered form.
func parseOptionLine(line string) (indent, slug, label, st string, hard, ok bool) {
	m := optionRe.FindStringSubmatch(strings.TrimRight(line, "\r"))
	if m == nil {
		return
	}
	indent = m[1]
	mark, rest := m[2], strings.TrimSpace(m[3])
	hard = len(m[4]) >= 2

	var suffix string
	for _, sep := range []string{" \u2014 ", " -- "} {
		if i := strings.Index(rest, sep); i >= 0 {
			suffix = strings.ToLower(rest[i+len(sep):])
			rest = strings.TrimSpace(rest[:i])
			break
		}
	}
	if m2 := slugRe.FindStringSubmatch(rest); m2 != nil {
		slug, rest = m2[1], strings.TrimSpace(m2[2])
	}
	struck := len(rest) > 4 && strings.HasPrefix(rest, "~~") && strings.HasSuffix(rest, "~~")
	if struck {
		rest = strings.TrimSpace(rest[2 : len(rest)-2])
	}
	if len(rest) > 4 && strings.HasPrefix(rest, "**") && strings.HasSuffix(rest, "**") {
		rest = strings.TrimSpace(rest[2 : len(rest)-2])
	}
	label = rest

	switch {
	case mark == "~":
		st = "tentative"
	case mark == "-":
		st = "neglected"
	case mark == "!":
		st = "challenged"
	case struck:
		st = "neglected"
	case strings.Contains(suffix, "challenged"):
		st = "challenged"
	case strings.Contains(suffix, "tentative"):
		st = "tentative"
	case mark == "x":
		st = "chosen"
	default:
		st = "eligible"
	}
	ok = true
	return
}

// canonical renders an option in the form that reads correctly on GitHub:
// a real task-list checkbox, with ruled-out options struck through.
func canonical(indent, slug, label, st string, hard bool) string {
	s := ""
	if slug != "" {
		s = "`" + slug + "` "
	}
	var out string
	switch st {
	case "chosen":
		out = fmt.Sprintf("%s- [x] %s**%s**", indent, s, label)
	case "tentative":
		out = fmt.Sprintf("%s- [x] %s**%s** \u2014 _tentative_", indent, s, label)
	case "challenged":
		out = fmt.Sprintf("%s- [x] %s**%s** \u2014 \u26a0\ufe0f _challenged_", indent, s, label)
	case "neglected":
		out = fmt.Sprintf("%s- [ ] %s~~%s~~", indent, s, label)
	default:
		out = fmt.Sprintf("%s- [ ] %s**%s**", indent, s, label)
	}
	if hard {
		out += "  " // preserve the markdown hard line break before an explanation
	}
	return out
}

// formatFile rewrites option lines in place. Reports whether it changed anything.
func formatFile(path string) (bool, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return false, err
	}
	nl := "\n"
	if strings.Contains(string(data), "\r\n") {
		nl = "\r\n"
	}
	lines := strings.Split(strings.ReplaceAll(string(data), "\r\n", "\n"), "\n")
	changed := false
	for i, line := range lines {
		indent, slug, label, st, hard, ok := parseOptionLine(line)
		if !ok {
			continue
		}
		if c := canonical(indent, slug, label, st, hard); c != line {
			lines[i], changed = c, true
		}
	}
	if !changed {
		return false, nil
	}
	return true, os.WriteFile(path, []byte(strings.Join(lines, nl)), 0o644)
}

func formatAll(root string, dryRun bool) ([]string, error) {
	var touched []string
	for _, dir := range []string{"guidance", "decisions"} {
		names, _ := filepath.Glob(filepath.Join(root, "docs", dir, "P-*.md"))
		for _, n := range names {
			if dryRun {
				data, err := os.ReadFile(n)
				if err != nil {
					return nil, err
				}
				for _, line := range strings.Split(strings.ReplaceAll(string(data), "\r\n", "\n"), "\n") {
					i, s, l, st, h, ok := parseOptionLine(line)
					if ok && canonical(i, s, l, st, h) != line {
						touched = append(touched, filepath.Base(n))
						break
					}
				}
				continue
			}
			changed, err := formatFile(n)
			if err != nil {
				return nil, err
			}
			if changed {
				touched = append(touched, filepath.Base(n))
			}
		}
	}
	return touched, nil
}

// ---------- the aggregation rule ----------

// Section III.F of Zimmermann et al., WICSA 2015: an occurrence's state
// follows from the states of its options and is never set by hand.
func derive(o *Block) string {
	n := map[string]int{}
	for _, opt := range o.Options {
		n[opt.State]++
	}
	switch {
	case n["challenged"] > 0:
		return "challenged"
	case n["chosen"] == 0 && n["tentative"] == 0 && n["neglected"] == 0:
		return "open"
	case n["chosen"] == 0 && n["tentative"] == 0 && n["eligible"] == 0:
		return "not applicable"
	case n["eligible"] == 0 && n["tentative"] == 0 && n["chosen"] > 0:
		return "decided"
	default:
		return "partially decided"
	}
}

func marked(o *Block, want string) []string {
	var out []string
	for _, opt := range o.Options {
		if opt.State == want {
			out = append(out, opt.Label)
		}
	}
	return out
}

// ---------- validation ----------

func validate(problems map[string]*Block, log []*Block, errs *[]string) {
	add := func(f string, a ...any) { *errs = append(*errs, fmt.Sprintf(f, a...)) }

	for _, p := range problems {
		if lv := p.Fields["Level"]; lv != "" && !contains(levels, lv) {
			add("%s: Level %q is not one of %v", p.ID, lv, levels)
		}
		keys := map[string]bool{}
		for _, opt := range p.Options {
			if opt.State != "eligible" {
				add("%s: %q is ticked in the guidance model; project state belongs in docs/decisions/",
					p.ID, opt.Label)
			}
			if keys[opt.Key] {
				add("%s: two options share the label %q", p.ID, opt.Label)
			}
			keys[opt.Key] = true
		}
		for k, v := range p.Fields {
			for _, ref := range problemRef.FindAllString(v, -1) {
				if _, ok := problems[ref]; !ok {
					add("%s %s: references %s, which does not exist", p.ID, k, ref)
				}
			}
			if positional.MatchString(v) {
				add("%s %s: refers to an option by position — name it instead", p.ID, k)
			}
		}
	}

	seen := map[string]bool{}
	for _, o := range log {
		if seen[o.ID] {
			add("%s:%d: duplicate occurrence %s", o.File, o.Line, o.ID)
		}
		seen[o.ID] = true

		p, ok := problems[o.Problem]
		if !ok {
			add("%s: problem %s is not in the guidance model", o.ID, o.Problem)
			continue
		}

		// The copied block must still match the template it came from.
		if len(o.Options) != len(p.Options) {
			add("%s: has %d options, %s has %d — re-sync the block",
				o.ID, len(o.Options), p.ID, len(p.Options))
		}
		have := map[string]bool{}
		for _, opt := range o.Options {
			have[opt.Key] = true
		}
		for _, opt := range p.Options {
			if !have[opt.Key] {
				add("%s: option %q was added to %s and is missing here", o.ID, opt.Label, p.ID)
			}
		}
		for _, opt := range o.Options {
			found := false
			for _, q := range p.Options {
				if q.Key == opt.Key {
					found = true
				}
			}
			if !found {
				add("%s: option %q is not defined under %s (renamed in %s?)",
					o.ID, opt.Label, p.ID, p.File)
			}
		}

		if len(marked(o, "chosen")) > 1 && !strings.Contains(strings.ToLower(o.Fields["Note"]), "subset") {
			add("%s: %d options chosen; add a Note saying it is a subset if that is intended",
				o.ID, len(marked(o, "chosen")))
		}

		switch derive(o) {
		case "decided", "partially decided":
			if o.Fields["ADR"] == "" {
				add("%s: is %q but names no ADR", o.ID, derive(o))
			}
		}
	}
}

func contains(xs []string, s string) bool {
	for _, x := range xs {
		if x == s {
			return true
		}
	}
	return false
}

// ---------- ADRs ----------

// An ADR merges three models: Nygard's document skeleton (context,
// decision, consequences), Zimmermann's Y-statement for the decision
// sentence, and Kruchten's ontology for the attributes and the
// relationships between decisions.
type ADR struct {
	ID     string
	Title  string
	State  string
	Occ    []string
	Kind   string
	Rel    map[string][]string
	YStmt  string
	File   string
}

var (
	adrTitleRe = regexp.MustCompile(`^#\s+ADR-(\d{4}):\s*(.+?)\s*$`)
	adrFileRe  = regexp.MustCompile(`^\d{4}-.*\.md$`)
	fmKeyRe    = regexp.MustCompile(`^([a-z-]+):\s*(.*)$`)
	quotedRe   = regexp.MustCompile(`[A-Za-z0-9#.-]+`)

	kruchtenStates = []string{"idea", "tentative", "decided", "approved", "challenged", "rejected", "obsolesced"}
	kruchtenKinds  = []string{"existence", "ban", "non-existence", "property", "executive"}
	adrRelations   = []string{"constrains", "enables", "bound-to", "is-alternative-to", "overrides", "supersedes", "superseded-by"}

	// Zimmermann's Y-statement connectives, in order.
	yConnectives = []string{"in the context of", "facing", "we decided for", "and neglected", "to achieve", "accepting", "because"}
)

// stripInlineComment removes a trailing "  # ..." but leaves a bare '#'
// alone, because occurrence ids look like P-EVT-01#1.
func stripInlineComment(v string) string {
	if i := strings.Index(v, "  #"); i >= 0 {
		v = v[:i]
	}
	return strings.TrimSpace(v)
}

func loadADRs(root string, errs *[]string) map[string]*ADR {
	out := map[string]*ADR{}
	names, _ := filepath.Glob(filepath.Join(root, "docs", "decisions", "adr", "*.md"))
	for _, n := range names {
		if !adrFileRe.MatchString(filepath.Base(n)) {
			continue // README and other notes in the folder are not ADRs
		}
		data, err := os.ReadFile(n)
		if err != nil {
			*errs = append(*errs, fmt.Sprintf("%s: %v", filepath.Base(n), err))
			continue
		}
		base := filepath.Base(n)
		a := &ADR{Rel: map[string][]string{}, File: base}
		inFM, seenFM := false, false
		section := ""
		var y []string
		for _, raw := range strings.Split(strings.ReplaceAll(string(data), "\r\n", "\n"), "\n") {
			line := strings.TrimRight(raw, " \t")
			if line == "---" {
				if !seenFM {
					inFM, seenFM = true, true
				} else if inFM {
					inFM = false
				}
				continue
			}
			if inFM {
				if strings.HasPrefix(strings.TrimSpace(line), "#") {
					continue
				}
				m := fmKeyRe.FindStringSubmatch(line)
				if m == nil {
					continue
				}
				k, v := m[1], stripInlineComment(m[2])
				switch k {
				case "id":
					a.ID = strings.Trim(v, `"`)
				case "state":
					a.State = v
				case "kind":
					a.Kind = v
				case "occurrences":
					a.Occ = quotedRe.FindAllString(v, -1)
				default:
					if contains(adrRelations, k) || k == "raises" {
						if v != "null" && v != "[]" {
							a.Rel[k] = quotedRe.FindAllString(v, -1)
						}
					}
				}
				continue
			}
			if m := adrTitleRe.FindStringSubmatch(line); m != nil {
				a.Title = m[2]
				continue
			}
			if strings.HasPrefix(line, "## ") {
				section = strings.ToLower(strings.TrimSpace(line[3:]))
				continue
			}
			if section == "decision" && strings.TrimSpace(line) != "" {
				y = append(y, strings.TrimSpace(line))
			}
		}
		a.YStmt = strings.ToLower(strings.Join(y, " "))
		if a.ID == "" {
			*errs = append(*errs, fmt.Sprintf("%s: front matter has no id", base))
			continue
		}
		if prev, dup := out[a.ID]; dup {
			*errs = append(*errs, fmt.Sprintf("ADR-%s: defined in both %s and %s", a.ID, prev.File, base))
		}
		out[a.ID] = a
	}
	return out
}

func validateADRs(adrs map[string]*ADR, problems map[string]*Block, log []*Block, errs *[]string) {
	add := func(f string, x ...any) { *errs = append(*errs, fmt.Sprintf(f, x...)) }

	byOcc := map[string]*Block{}
	for _, o := range log {
		byOcc[o.ID] = o
	}

	for id, a := range adrs {
		if a.Title == "" {
			add("ADR-%s: no `# ADR-%s: Title` heading", id, id)
		}
		if !contains(kruchtenStates, a.State) {
			add("ADR-%s: state %q is not a Kruchten state %v", id, a.State, kruchtenStates)
		}
		kindOK := false
		for _, k := range kruchtenKinds {
			if strings.HasPrefix(a.Kind, k) {
				kindOK = true
			}
		}
		if !kindOK {
			add("ADR-%s: kind %q does not start with a Kruchten decision kind %v", id, a.Kind, kruchtenKinds)
		}

		// Zimmermann: the decision sentence must actually be a Y-statement.
		pos := 0
		for _, c := range yConnectives {
			i := strings.Index(a.YStmt[pos:], c)
			if i < 0 {
				add("ADR-%s: Decision is not a Y-statement — missing or out-of-order %q", id, c)
				break
			}
			pos += i + len(c)
		}

		// Kruchten: relationship targets must resolve.
		for rel, targets := range a.Rel {
			for _, t := range targets {
				if rel == "raises" {
					if _, ok := problems[t]; !ok {
						add("ADR-%s raises %s, which is not a problem in the guidance model", id, t)
					}
					continue
				}
				if _, ok := adrs[t]; !ok {
					add("ADR-%s %s %s, which is not an existing ADR", id, rel, t)
				}
			}
		}

		if len(a.Occ) == 0 {
			add("ADR-%s: names no occurrence", id)
		}
		for _, oid := range a.Occ {
			o, ok := byOcc[oid]
			if !ok {
				add("ADR-%s: occurrence %s does not exist", id, oid)
				continue
			}
			if o.Fields["ADR"] != id {
				add("ADR-%s claims %s, but that occurrence names ADR %q — the link must go both ways",
					id, oid, o.Fields["ADR"])
				continue
			}
			// Kruchten state must agree with the derived occurrence state.
			switch derive(o) {
			case "challenged":
				if a.State != "challenged" {
					add("ADR-%s: %s is challenged, so the ADR state cannot be %q", id, oid, a.State)
				}
			case "open", "not applicable":
				add("ADR-%s: %s is %q and should not name an ADR", id, oid, derive(o))
			default:
				if len(marked(o, "chosen")) == 0 && len(marked(o, "tentative")) > 0 && a.State != "tentative" {
					add("ADR-%s: %s has only a tentative option, so the ADR state should be tentative, not %q",
						id, oid, a.State)
				}
			}
		}
	}

	for _, o := range log {
		ref := o.Fields["ADR"]
		if ref == "" {
			continue
		}
		a, ok := adrs[ref]
		if !ok {
			add("%s: names ADR-%s, which does not exist", o.ID, ref)
			continue
		}
		if !contains(a.Occ, o.ID) {
			add("%s: names ADR-%s, but that ADR does not list this occurrence", o.ID, ref)
		}
	}
}

// ---------- init ----------

func initBlock(root string, problems map[string]*Block, log []*Block, id string) error {
	p, ok := problems[id]
	if !ok {
		return fmt.Errorf("%s is not in the guidance model", id)
	}
	n := 1
	for _, o := range log {
		if o.Problem == id {
			n++
		}
	}
	var b strings.Builder
	fmt.Fprintf(&b, "\n---\n\n### %s#%d - *%s*\n\n", id, n, p.Title)
	b.WriteString("- **Trigger:** \n- **ADR:** \n- **Sprint:** \n\n- **Options:**\n")
	for _, opt := range p.Options {
		fmt.Fprintf(&b, "  - [ ] **%s**\n", opt.Label)
	}

	path := filepath.Join(root, "docs", "decisions", p.File)
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()
	if _, err := f.WriteString(b.String()); err != nil {
		return err
	}
	fmt.Printf("added %s#%d to %s — fill in Trigger and tick the boxes\n", id, n, path)
	return nil
}

// ---------- ADR scaffolding ----------

func slugify(s string) string {
	var b strings.Builder
	prevDash := true
	for _, r := range strings.ToLower(s) {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			prevDash = false
		default:
			if !prevDash {
				b.WriteByte('-')
				prevDash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}

func nextADRNumber(adrs map[string]*ADR) string {
	max := 0
	for id := range adrs {
		n := 0
		fmt.Sscanf(id, "%d", &n)
		if n > max {
			max = n
		}
	}
	return fmt.Sprintf("%04d", max+1)
}

// adrStateFor maps the occurrence's derived state onto Kruchten's
// lifecycle, so the scaffold cannot start out inconsistent.
func adrStateFor(o *Block) string {
	switch derive(o) {
	case "challenged":
		return "challenged"
	default:
		if len(marked(o, "chosen")) == 0 && len(marked(o, "tentative")) > 0 {
			return "tentative"
		}
		return "decided"
	}
}

func joinBold(xs []string) string {
	if len(xs) == 0 {
		return "TODO"
	}
	out := make([]string, len(xs))
	for i, x := range xs {
		out[i] = "**" + x + "**"
	}
	if len(out) == 1 {
		return out[0]
	}
	return strings.Join(out[:len(out)-1], ", ") + " and " + out[len(out)-1]
}

// setOccurrenceADR writes the number back into the occurrence block, so
// the two halves of the link are never created one without the other.
func setOccurrenceADR(root string, o *Block, adrID string) error {
	path := filepath.Join(root, "docs", "decisions", o.File)
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	nl := "\n"
	if strings.Contains(string(data), "\r\n") {
		nl = "\r\n"
	}
	lines := strings.Split(strings.ReplaceAll(string(data), "\r\n", "\n"), "\n")

	start := o.Line - 1
	if start < 0 || start >= len(lines) {
		return fmt.Errorf("%s: occurrence %s is not at line %d any more", o.File, o.ID, o.Line)
	}
	end := len(lines)
	for i := start + 1; i < len(lines); i++ {
		if strings.HasPrefix(lines[i], "### ") {
			end = i
			break
		}
	}
	insertAt := -1
	for i := start; i < end; i++ {
		t := strings.TrimSpace(lines[i])
		if strings.HasPrefix(t, "- **ADR:**") {
			lines[i] = "- **ADR:** " + adrID
			return os.WriteFile(path, []byte(strings.Join(lines, nl)), 0o644)
		}
		if strings.HasPrefix(t, "- **Trigger:**") {
			insertAt = i + 1
		}
	}
	if insertAt < 0 {
		insertAt = start + 1
	}
	lines = append(lines[:insertAt], append([]string{"- **ADR:** " + adrID}, lines[insertAt:]...)...)
	return os.WriteFile(path, []byte(strings.Join(lines, nl)), 0o644)
}

// scaffoldADR writes a new ADR pre-filled from the occurrence: the
// Kruchten state, and the chosen and neglected options already spliced
// into Zimmermann's Y-statement.
func scaffoldADR(root string, problems map[string]*Block, log []*Block, adrs map[string]*ADR, occID, title string) error {
	var o *Block
	for _, b := range log {
		if b.ID == occID {
			o = b
		}
	}
	if o == nil {
		return fmt.Errorf("occurrence %s not found in docs/decisions/", occID)
	}
	if st := derive(o); st == "open" || st == "not applicable" {
		return fmt.Errorf("%s is %q — tick some boxes before writing an ADR", occID, st)
	}
	if ref := o.Fields["ADR"]; ref != "" {
		if _, ok := adrs[ref]; ok {
			return fmt.Errorf("%s already points at ADR-%s", occID, ref)
		}
	}
	p := problems[o.Problem]
	if p == nil {
		return fmt.Errorf("%s: problem %s is not in the guidance model", occID, o.Problem)
	}

	chosen := append(marked(o, "chosen"), marked(o, "tentative")...)
	chosen = append(chosen, marked(o, "challenged")...)
	if title == "" {
		if len(chosen) > 0 {
			title = chosen[0]
		} else {
			title = p.Title
		}
	}
	id := nextADRNumber(adrs)
	state := adrStateFor(o)

	var b strings.Builder
	fmt.Fprintf(&b, `---
# --- Nygard: the record itself ---
id: "%s"
state: %s
date: %s
# --- Zimmermann: which decision problem this outcome answers ---
occurrences: [%s]
# --- Kruchten: ontology attributes ---
kind: TODO            # existence | ban | property | executive
scope: TODO
cost: TODO            # S | M | L
risk: TODO            # S | M | L
# --- Kruchten: relationships between decisions ---
constrains: []
enables: []
bound-to: []
is-alternative-to: []
overrides: null
raises: []
supersedes: null
superseded-by: null
---

# ADR-%s: %s

## Epitome

TODO — one line, what was decided.

## Context

TODO — the project-specific situation only. Do not restate the generic
problem; that lives in docs/guidance/%s.

`, id, state, time.Now().Format("2006-01-02"), o.ID, id, title, p.File)

	fmt.Fprintf(&b, `## Decision

In the context of TODO, facing TODO, we decided for %s and neglected %s,
to achieve TODO, accepting TODO, because TODO.

## Consequences

- Positive: TODO
- Negative: TODO

## Implementation

TODO — files and modules touched.
`, joinBold(chosen), joinBold(marked(o, "neglected")))

	dir := filepath.Join(root, "docs", "decisions", "adr")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	path := filepath.Join(dir, fmt.Sprintf("%s-%s.md", id, slugify(title)))
	if _, err := os.Stat(path); err == nil {
		return fmt.Errorf("%s already exists", path)
	}
	if err := os.WriteFile(path, []byte(b.String()), 0o644); err != nil {
		return err
	}
	if err := setOccurrenceADR(root, o, id); err != nil {
		return err
	}
	fmt.Printf("wrote %s\n", path)
	fmt.Printf("linked %s -> ADR-%s\n", o.ID, id)
	fmt.Println("fill in every TODO, then run `go run ./tools/backlog -check`")
	return nil
}

// ---------- output ----------

var order = map[string]int{
	"challenged": 0, "open": 1, "partially decided": 2, "decided": 3, "not applicable": 4,
}

func render(problems map[string]*Block, log []*Block) string {
	sorted := append([]*Block(nil), log...)
	sort.SliceStable(sorted, func(i, j int) bool {
		a, b := derive(sorted[i]), derive(sorted[j])
		if a != b {
			return order[a] < order[b]
		}
		return sorted[i].ID < sorted[j].ID
	})

	var b strings.Builder
	b.WriteString("<!-- GENERATED by tools/backlog. Do not hand-edit. -->\n")
	b.WriteString("<!-- Regenerate: go run ./tools/backlog -->\n\n# Decision Backlog\n\n")
	fmt.Fprintf(&b, "Generated %s from `docs/decisions/`.\n\n", time.Now().Format("2006-01-02"))
	b.WriteString("Like a product backlog, this is never meant to reach zero. An open\n")
	b.WriteString("decision with an explicit trigger is deferred, not forgotten.\n\n")
	b.WriteString("| Occurrence | Problem | Status | Chosen | Level | Trigger | ADR | Sprint |\n")
	b.WriteString("|---|---|---|---|---|---|---|---|\n")

	counts := map[string]int{}
	for _, o := range sorted {
		p := problems[o.Problem]
		st := derive(o)
		counts[st]++
		shown := st
		if st == "open" || st == "challenged" {
			shown = "**" + st + "**"
		}
		chosen := strings.Join(marked(o, "chosen"), ", ")
		if t := marked(o, "tentative"); len(t) > 0 {
			extra := strings.Join(t, ", ") + " *(tentative)*"
			if chosen == "" {
				chosen = extra
			} else {
				chosen += ", " + extra
			}
		}
		fmt.Fprintf(&b, "| `%s` | %s | %s | %s | %s | %s | %s | %s |\n",
			o.ID, p.Title, shown, dash(chosen), dash(p.Fields["Level"]),
			dash(o.Fields["Trigger"]), dash(o.Fields["ADR"]), dash(o.Fields["Sprint"]))
	}

	b.WriteString("\n## Summary\n\n| Status | Count |\n|---|---|\n")
	for _, s := range []string{"challenged", "open", "partially decided", "decided", "not applicable"} {
		if counts[s] > 0 {
			fmt.Fprintf(&b, "| %s | %d |\n", s, counts[s])
		}
	}
	fmt.Fprintf(&b, "| **total instantiated** | **%d** |\n\n", len(log))
	fmt.Fprintf(&b, "Problems in the guidance model: %d. Instantiated: %d.\n", len(problems), len(log))

	var notes []string
	for _, o := range sorted {
		if o.Fields["Note"] != "" {
			notes = append(notes, fmt.Sprintf("- `%s` — %s", o.ID, o.Fields["Note"]))
		}
	}
	if len(notes) > 0 {
		b.WriteString("\n## Notes\n\n")
		b.WriteString(strings.Join(notes, "\n"))
		b.WriteString("\n")
	}
	return b.String()
}

func dash(s string) string {
	if s == "" {
		return "—"
	}
	return s
}

// ---------- main ----------

func main() {
	root := flag.String("root", ".", "repository root")
	check := flag.Bool("check", false, "validate only, do not write")
	format := flag.Bool("format", false, "normalise option lines and exit; with -check, report and write nothing")
	flag.Parse()

	// -format stands alone, like gofmt: it never validates, so a file that
	// currently fails -check can still be tidied.
	if *format {
		if len(flag.Args()) > 0 {
			fmt.Fprintln(os.Stderr, "error: -format takes no subcommand")
			os.Exit(2)
		}
		touched, err := formatAll(*root, *check)
		if err != nil {
			fmt.Fprintln(os.Stderr, "error:", err)
			os.Exit(2)
		}
		if len(touched) == 0 {
			fmt.Println("ok — every option line is in canonical form")
			return
		}
		if *check {
			fmt.Fprintf(os.Stderr, "\n%d file(s) not in canonical form:\n\n", len(touched))
			for _, f := range touched {
				fmt.Fprintln(os.Stderr, "  x "+f)
			}
			fmt.Fprintln(os.Stderr, "\nrun `go run ./tools/backlog -format`")
			os.Exit(1)
		}
		fmt.Println("formatted", strings.Join(touched, ", "))
		return
	}

	var errs []string
	problems, log, err := load(*root, &errs)
	if err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(2)
	}

	if args := flag.Args(); len(args) > 0 {
		var err error
		switch {
		case args[0] == "init" && len(args) == 2:
			err = initBlock(*root, problems, log, args[1])
		case args[0] == "adr" && (len(args) == 2 || len(args) == 3):
			title := ""
			if len(args) == 3 {
				title = args[2]
			}
			err = scaffoldADR(*root, problems, log, loadADRs(*root, &errs), args[1], title)
		default:
			fmt.Fprintln(os.Stderr, "usage: backlog [-check]")
			fmt.Fprintln(os.Stderr, "       backlog -format [-check]")
			fmt.Fprintln(os.Stderr, "       backlog init <problem-id>")
			fmt.Fprintln(os.Stderr, "       backlog adr <occurrence-id> [title]")
			os.Exit(2)
		}
		if err != nil {
			fmt.Fprintln(os.Stderr, "error:", err)
			os.Exit(2)
		}
		return
	}

	if *check {
		if unformatted, err := formatAll(*root, true); err != nil {
			fmt.Fprintln(os.Stderr, "error:", err)
			os.Exit(2)
		} else {
			for _, f := range unformatted {
				errs = append(errs, fmt.Sprintf("%s: option lines are not in canonical form — run `go run ./tools/backlog`", f))
			}
		}
	}

	validate(problems, log, &errs)
	adrs := loadADRs(*root, &errs)
	validateADRs(adrs, problems, log, &errs)
	if len(errs) > 0 {
		sort.Strings(errs)
		fmt.Fprintf(os.Stderr, "\n%d problem(s):\n\n", len(errs))
		for _, e := range errs {
			fmt.Fprintln(os.Stderr, "  x "+e)
		}
		fmt.Fprintln(os.Stderr)
		os.Exit(1)
	}
	fmt.Printf("ok — %d problems, %d occurrences, %d ADRs\n", len(problems), len(log), len(adrs))
	if *check {
		return
	}

	if touched, err := formatAll(*root, false); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(2)
	} else if len(touched) > 0 {
		fmt.Println("formatted", strings.Join(touched, ", "))
	}

	out := filepath.Join(*root, "docs", "backlog.md")
	if err := os.WriteFile(out, []byte(render(problems, log)), 0o644); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(2)
	}
	fmt.Println("wrote", out)
}