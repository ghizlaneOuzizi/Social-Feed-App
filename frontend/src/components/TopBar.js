import React from 'react'
import logo from '../assets/hoaxify-logo.png';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { connect } from 'react-redux';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
class TopBar extends React.Component{
  state = {
    dropDownVisible: false
  }
  componentDidMount(){
    document.addEventListener('click', this.onClickTracker);
  }
  componentWillUnmount(){
    document.removeEventListener('click', this.onClickTracker);
  }
  onClickTracker = (event) => {
    if(this.actionArea && !this.actionArea.contains(event.target)){
       this.setState({
         dropDownVisible : false
       })
    }
  }
  onClickMyProfile = ()=>{
    this.setState({
      dropDownVisible : false
    })
  }
  onClickDisplayName = () =>{
    this.setState({
      dropDownVisible : true
    })
  }
  onClickLogout = () => {
    this.setState({
      dropDownVisible: false
    })
    const action = {
      type: 'Logout-success'
    };
    this.props.dispatch(action);
  }
  assignActionArea = (area) => {
    this.actionArea = area;
  }
  render(){
        let links = (
            <ul className='nav navbar-nav ms-auto'>
                   <li className='nav-item'>
                     <Link to="/Signup" className="nav-link">
                       Sign Up
                     </Link>
                   </li>
                   <li className='nav-item'>
                     <Link to="/Login" className="nav-link">
                       Login
                     </Link>
                   </li>
                </ul>
        )
        if(this.props.user.isLoggedIn){
          let dropDownClass = "p-0 shadow dropdown-menu";
          if(this.state.dropDownVisible){
            dropDownClass += " show";
          }
          links = (
            <ul className='nav navbar-nav ms-auto' ref={this.assignActionArea}>
                  <li className='nav-item dropdown'>
                   <div className='d-flex' style={{ cursor: 'pointer'}} onClick={this.onClickDisplayName}>
                    <ProfileImageWithDefault
                      className = "rounded-circle"
                      width="32"
                      height="32"
                      image={this.props.user.image}
                    />
                     <span className='nav-link dropdown-toggle'>
                      {this.props.user.displayName}
                      </span>
                    </div>
                    <div className={dropDownClass} data-testid="drop-down-menu">
                        <Link to={`/${this.props.user.username}`}
                         className='dropdown-item'
                         onClick={this.onClickMyProfile}
                         >
                            <FaUser style={{ marginRight: '8px' }}/>
                            My Profile
                        </Link>
                        <span
                          className='dropdown-item'
                          onClick={this.onClickLogout}
                          style={{cursor: 'pointer'}}
                        >
                          <FaSignOutAlt style={{ marginRight: '8px' }} />
                          Logout
                        </span>
                    </div>
                    </li>
            </ul>
          )
        }
        return (
            <div className='bg-white shadow-sm mb-2'>
              <div className='container'>
                <nav className='navbar navbar-light navbar-expand'>
                <Link to='/' className="navbar-brand">
                 <img src={logo} width='60' alt='Hoaxify'/> BuzzConnect
                </Link>
                {links}
                </nav>
              </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
  return{
    user : state
  }
}
export default connect(mapStateToProps)(TopBar);