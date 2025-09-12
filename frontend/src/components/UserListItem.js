import React from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { Link } from 'react-router-dom'
const UserListItem = (props) => {
    return (
        <Link to={`/${props.user.username}`}
        className='list-group-item list-group-item-action'
        >
           <ProfileImageWithDefault
             className="rounded-circle"
             alt="profile"
             width="32"
             height="32"
             image = {props.user.image}
           />
           {`${props.user.displayName}@${props.user.username}`}
        </Link>
    )
}
export default UserListItem;