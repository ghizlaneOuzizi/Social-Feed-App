import React from "react";
import { Route, Switch } from "react-router-dom/cjs/react-router-dom.min";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage"
import UserSignupPage from "../pages/UserSignupPage";
import UserPage from "../pages/UserPage";
import TopBar from "../components/TopBar";

function App() {
  return (
    <div>
      <TopBar />
      <div className='container'>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/Login"  component={LoginPage}/>
          <Route path="/Signup" component={UserSignupPage}/>
          <Route path="/:username" component={UserPage}/>
        </Switch>
      </div>
    </div>
  );
}

export default App;
