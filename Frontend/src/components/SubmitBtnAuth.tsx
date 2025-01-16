interface Props{
    title: string;
    onClick: () => void;
}
export default function SubmitBtnAuth({ title, onClick }: Props){
    return(
        <button className="submit-btn-verif" onClick={onClick}>{title}</button>
    )
}