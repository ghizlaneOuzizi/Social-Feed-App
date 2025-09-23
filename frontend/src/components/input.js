import React from "react";

const Input = (props) => {

    let inputClassName = 'form-control';
    if(props.type === 'file'){
        inputClassName += '-file';
    }
    if(props.hasError !== undefined){
        inputClassName += props.hasError ? ' is-invalid' : ' is-valid'
    }
    return (
        <div className="mb-3">
            {props.label && <label className="form-label fw-semibold">{props.label}</label>}
            <input
             className={`form-control shadow-sm ${inputClassName}`}
             type={props.type || 'text'}
             placeholder={props.placeholder}
             value={props.value}
             onChange={props.onChange}
             />
             {props.hasError && (<span className="invalid-feedback">{props.error}</span>)}
        </div>
    );
};

Input.defaultProps = {
    onChange: ()=>{}
}
export default Input;