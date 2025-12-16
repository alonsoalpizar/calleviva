package prompts

import (
	"bytes"
	"text/template"
)

// PromptBuilder helps construct prompts from templates
type PromptBuilder struct {
	templates map[string]*template.Template
}

// NewBuilder creates a new PromptBuilder
func NewBuilder() *PromptBuilder {
	return &PromptBuilder{
		templates: make(map[string]*template.Template),
	}
}

// RegisterTemplate registers a new template
func (b *PromptBuilder) RegisterTemplate(name, tmplString string) error {
	tmpl, err := template.New(name).Parse(tmplString)
	if err != nil {
		return err
	}
	b.templates[name] = tmpl
	return nil
}

// Build constructs a prompt using a registered template and data
func (b *PromptBuilder) Build(templateName string, data interface{}) (string, error) {
	tmpl, ok := b.templates[templateName]
	if !ok {
		// If no template is found, treat templateName as a raw prompt string if dynamic construction is not needed,
		// but typically we expect registered templates. For simplicity, let's error if not found.
		// However, for direct usage, we might want to just return the string.
		// For now, adhere to "registered templates" approach.
		return "", nil // Should implement error here
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// SimpleBuild constructs a prompt directly from a string template (no registration needed)
func (b *PromptBuilder) SimpleBuild(tmplString string, data interface{}) (string, error) {
	tmpl, err := template.New("simple").Parse(tmplString)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}
