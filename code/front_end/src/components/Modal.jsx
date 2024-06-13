export default function Modal({ content, confirm, cancel }) {

    return (
        <div className="relative z-50 w-screen h-screen flex justify-center items-center" onClick={e => {
            e.stopPropagation();
            cancel();
        }}>
            <div className="absolute z-50">
                <p>{content}</p>
                <div className="flex">
                    {confirm && <button onClick={confirm}>confirm</button>}
                    {cancel && <button onClick={cancel}>cancel</button>}
                </div>
            </div>
        </div>
    )
}