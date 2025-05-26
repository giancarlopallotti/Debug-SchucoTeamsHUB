// Percorso: /components/TagDropdownSelect.js
// Selettore tag classico multi-select
// Autore: ChatGPT – 25/05/2025

export default function TagDropdownSelect({ tags, selectedTags, onChange }) {
  return (
    <select
      multiple
      className="border rounded w-full text-xs"
      style={{ minHeight: "52px", fontSize: "12px" }}
      value={selectedTags.map(t => t.id)}
      onChange={e => {
        const values = Array.from(e.target.selectedOptions, opt => Number(opt.value));
        const newSelected = tags.filter(t => values.includes(t.id));
        onChange(newSelected);
      }}
    >
      {tags.map(tag => (
        <option key={tag.id} value={tag.id}>
          {tag.name}
        </option>
      ))}
    </select>
  );
}
