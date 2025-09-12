import React from "react";
import defaultPicture from '../assets/profile.png';
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import { FaUserEdit } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { FaUndo } from "react-icons/fa";
import Input from './input';
import ButtonWithProgress from "./ButtonWithProgress";
const ProfileCard = (props) => {
    const { displayName, username, image } = props.user;

    const showEditButton = props.isEditable && !props.inEditMode;
    let imageSource = defaultPicture;
    if(image){
        imageSource = '/images/profile/' + image;
    }
    return (
       <div className="card">
        <div className="card-header text-center">
            <ProfileImageWithDefault
             alt="profile"
             width="200"
             image = {image}
             src={props.loadedImage}
             className="rounded-circle shadow"
             />
        </div>
        <div className="card-body text-center">
            {!props.inEditMode && <h4>{`${displayName}@${username}`}</h4>}
            {props.inEditMode && (
              <div className="mb-2">
                <Input
                  value={displayName}
                  label = {`Change Display Name for ${username}`}
                  onChange = {props.onChangeDisplayName}
                  hasError = {props.errors.displayName && true}
                  error = {props.errors.displayName}
                />
                <div className="mt-2">
                <Input
                  type = "file"
                  onChange={props.onFileSelect}
                  hasError={props.errors.image && true}
                  error={props.errors.image}
                />
                </div>
              </div>
            )}
            {showEditButton && (
            <button className="btn btn-outline-success" onClick={props.onClickEdit}>
                <FaUserEdit /> Edit
            </button>)}
            {props.inEditMode && (
            <div>
              <ButtonWithProgress className="btn btn-primary"
                  onClick={props.onClickSave}
                  text={
                    <>
                    <FaSave />
                     Save </>
                   }
                  pendingApiCall={props.pendingUpdateCall}
                  disabled = {props.pendingUpdateCall} >
              </ButtonWithProgress>
              <button
                  className="btn btn-outline-secondary ms-2"
                  onClick={props.onClickCancel}
                  disabled = {props.pendingUpdateCall}
                  >
                  <FaUndo /> Cancel
              </button>
            </div>
        )}
       </div>
       </div>
    )
};

ProfileCard.defaultProps = {
  errors : {}
}
export default ProfileCard