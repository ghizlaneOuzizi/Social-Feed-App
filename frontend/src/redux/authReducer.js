const initalState = {
    id:0,
    username: '',
    displayName:'',
    image:'',
    password:'',
    isLoggedIn: false
};

export default function authReducer(state = initalState, action){
   if(action.type === 'Logout-success'){
    return { ...initalState };
   }
   else if(action.type === 'Login-success'){
    return {
        ...action.payload,
        isLoggedIn: true
    }
   }else if(action.type === 'update-success'){
    return {
        ...state,
        displayName: action.payload.displayName,
        image: action.payload.image
    }
   }
    return state;
}