import React from "react";
import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './HomePage';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';
import * as apiCalls from '../api/apiCalls';
const defaultState = {
    id:1,
    username: 'user1',
    displayName:'display1',
    image:'profile.png',
    password:'Password',
    isLoggedIn: true
};
let store;
const setup = (state = defaultState) => {
    store = createStore(authReducer, state);
    return render (
       <Provider store={store}>
          <HomePage/>
        </Provider>
    );
}
apiCalls.loadHoaxes = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3
    }
});
describe('HomePage', ()=>{
    describe('Layout', ()=> {
       it('has root page div' , () => {
        const { queryByTestId } = setup();
        const homePageDiv = queryByTestId('homepage');
        expect(homePageDiv).toBeInTheDocument();
       });
       it('displays hoax submit when user logged in' , () => {
        const { container } = setup();
        const textArea = container.querySelector('textArea');
        expect(textArea).toBeInTheDocument();
       });
       it('displays hoax submit when user not logged in' , () => {
        const notLoggedInState = {
            id : 0,
            username: '',
            displayName: '',
            password: '',
            image: '',
            isLoggedIn: false
        };
        const { container } = setup(notLoggedInState);
        const textArea = container.querySelector('textArea');
        expect(textArea).not.toBeInTheDocument();
       });
    });
});