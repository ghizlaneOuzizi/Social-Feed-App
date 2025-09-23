import React from "react";
import UserList from "../components/UserList";
import HoaxSubmit from "../components/HoaxSubmit";
import { connect } from "react-redux";
import HoaxFeed from "../components/HoaxFeed";
class HomePage extends React.Component {
    render(){
        return (
           <div data-testid="homepage">
            <div className="row gx-4">
               <div className="col-8">
                 {this.props.loggedInUser.isLoggedIn && (
                  <div className="mb-4"><HoaxSubmit /></div>)}
                 <HoaxFeed/>
               </div>
               <div className="col-4">
                 <UserList/>
               </div>
            </div>

           </div>
        )
    }
}

const mapStateProps = (state) => {
    return {
        loggedInUser : state
    }
}
export default connect(mapStateProps)(HomePage);