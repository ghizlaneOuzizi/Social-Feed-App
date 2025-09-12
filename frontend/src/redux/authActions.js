import * as apiCalls from '../api/apiCalls';
export const loginSucces = (loginUserData) => {
    return {
        type : "Login-success",
        payload: loginUserData
    };
};

export const loginHandler = (Credentials) => {
    return function(dispatch){
     return apiCalls.login(Credentials).then(response =>{
       dispatch(
          loginSucces({
                ...response.data,
                password: Credentials.password
            })
       );
       return response;
    });
    };
};

export const signupHandler = (user) => {
    return function(dispatch){
     return apiCalls.signup(user).then(response =>{
       return dispatch(
         loginHandler(user) );
    });
    };
}