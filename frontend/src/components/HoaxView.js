import React, { Component } from 'react'
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { connect } from 'react-redux';
class HoaxView extends Component {
  render() {
    const { hoax, onClickDelete } = this.props;
    const { user, date } = hoax;
    const { username, displayName, image} = user;
    const relativeDate = format(date);
    const attachmentImageVisible =
    hoax.attachement && hoax.attachement.fileType.startsWith('image');
    const ownedByLoggedInUser = user.id === this.props.loggedInUser.id;

    return (
      <div className='card p-1'>
        <div className='d-flex'>
         <ProfileImageWithDefault
          className="rounded-circle m-1"
          width="32"
          height="32"
          image={image}/>
          <div className='flex-fill m-auto pl-2'>
            <Link to={`/${username}`} className="list-group-item-action">
              <h6 className='d-inline ms-2'>
               {displayName}&{username}
              </h6>
            </Link>
            <span className='text-black-50'> - </span>
            <span className='text-black-50'>{relativeDate}</span>
          </div>
          {ownedByLoggedInUser && (
            <button
                className="btn btn-outline-danger btn-sm btn-block text-left"
                onClick={onClickDelete}
              >
                <FaTrash /> Delete
            </button>
          )}
        </div>
        <div className='ps-5 mb-2'>{hoax.content}</div>
         {attachmentImageVisible && (
         <div className="pl-5">
           <img
             alt="attachment"
             src={`/images/attachements/${hoax.attachement.name}`}
             className="img-fluid"
           />
         </div>
         )}
        </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    loggedInUser: state,
  };
};

export default connect(mapStateToProps)(HoaxView);
