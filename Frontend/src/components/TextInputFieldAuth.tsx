interface Props {
  title: string;
  type: string;
  onChange: (item: string) => void;
}

export default function TextInputFieldAuth({ title, type, onChange }: Props) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={title}>
        {title}
      </label>
      <div className="field-input-container">
        <input
          id={title}
          type={type}
          className="field-input"
          onChange={(e)=>onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
