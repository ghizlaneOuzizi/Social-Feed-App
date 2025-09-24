import React, { Component } from "react";
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import { connect } from "react-redux";
import { FaTimes } from "react-icons/fa";
import * as apiCalls from '../api/apiCalls';
import ButtonWithProgress from "./ButtonWithProgress";
import Input from "./input"
class HoaxSubmit extends Component {
    state = {
        focused: false,
        errors: {},
        file: undefined,
        image: undefined,
        pendingApiCall : false,
        content:undefined,
        attachment : undefined
    };
    resetState = () => {
      this.setState({
        pendingApiCall: false,
        focused: false,
        content: '',
        errors: {},
        image: undefined,
        file: undefined,
        attachment: undefined
       });
    };
    onFocus = () => {
        this.setState({
            focused: true,
            content: undefined,
            pendingApiCall : false
        });
    };

    onFileSelect = (event) => {
        if (event.target.files.length === 0) {
          return;
        }

        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          this.setState({
              image: reader.result,
              file
          }, () => {
            this.uploadFile()
          });
        };
    reader.readAsDataURL(file);

    };

    uploadFile = () => {
        const body = new FormData();
        body.append('file', this.state.file);
        apiCalls.postHoaxFile(body).then((response) => {
            console.log("Upload finished. Response:", response.data);
            this.setState({ attachment : response.data}, () => {
             console.log("State after upload:", this.state.attachment);
        });
        });
    };
    onChangeContent = (event)=>{
        const value = event.target.value;
        this.setState({content: value, errors: {}})
    }
    onClickHoaxify = () => {
        const body = {
            content: this.state.content,
            attachement : this.state.attachment
        };
        this.setState({pendingApiCall : true})
        apiCalls.postHoax(body)
                .then((response)=>{
                   console.log(response.data);
                   this.resetState();
                })
                .catch((error) => {
                    let errors ={};
                    if(error.response.data && error.response.data.validationErrors){
                        errors = error.response.data.validationErrors
                    }
                    this.setState({pendingApiCall : false, errors});
                })
    };
    render() {
        let textAreaClassName = "form-control w-100"
        if(this.state.errors.content){
            textAreaClassName+= ' is-invalid'
        }
        return(

           <div className="card d-flex flex-row p-1">
              <ProfileImageWithDefault
                className="rounded-circle m-1"
                width = "32"
                height = "32"
                image ={this.props.loggedInUser.image}
              />
              <div className="flex-fill">
                 <textarea
                  className = {`shadow-none p-2 bg-light rounded ${textAreaClassName}`}
                  rows={this.state.focused ? 3 : 1}
                  onFocus={this.onFocus}
                  value={this.state.content}
                  onChange={this.onChangeContent}
                 />
                 {this.state.errors.content && (
                    <span className="invalid-feedback">
                         {this.state.errors.content}
                    </span>
                 )}
                { this.state.focused &&
                 <div className="mt-2">
                    <div className="file">
                       <Input type = "file" onChange={this.onFileSelect}/>
                       {this.state.image && (
                         <img
                           className="mt-1 img-thumbnail"
                           src={this.state.image}
                           alt="upload"
                           width="128"
                           height="64"
                         />
                       )}
                    </div>
                  <div className="d-flex justify-content-end mt-1">
                    <ButtonWithProgress
                            className="btn btn-success"
                            onClick={this.onClickHoaxify}
                            disabled = {this.state.pendingApiCall  || (this.state.file && !this.state.attachment)}
                            pendingApiCall={this.state.pendingApiCall}
                            text="Hoaxify"
                            />
                    <button
                      className="btn btn-light ml-2"
                      onClick={this.resetState}
                      disabled = {this.state.pendingApiCall}
                      >
                        <FaTimes />
                        Cancel
                    </button>
                 </div>
                 </div>
                }
              </div>

           </div>
        );
    }
}

const mapStateProps = (state) => {
    return {
        loggedInUser : state
    }
}
export default connect(mapStateProps)(HoaxSubmit);