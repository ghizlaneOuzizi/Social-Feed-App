import React from "react";
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom/cjs/react-router-dom.min";
import App from './App';
import { Provider } from 'react-redux';
import axios from "axios";
import configureStore from "../redux/configureStore";
import * as apiCalls from '../api/apiCalls'

const mockSuccessGetUser1 = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
  },
};
const mockSuccessGetUser2 = {
  data: {
    id: 2,
    username: 'user2',
    displayName: 'display2',
    image: 'profile2.png',
  },
};
const mockFailGetUser = {
  response: {
    data: {
      message: 'User Not Found',
    },
  },
};
const setUserOneLoggedInStorage = () => {
  localStorage.setItem(
    'hoax-auth',
    JSON.stringify({
      id: 1,
      username: 'user1',
      displayName: 'display1',
      image: 'profile1.png',
      password: 'P4ssword',
      isLoggedIn: true,
    })
  );
};
apiCalls.loadHoaxes = jest.fn().mockResolvedValue({
    data: {
        content: [],
        number: 0,
        size: 3
    }
});
apiCalls.getUser = jest.fn().mockResolvedValue({
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png',
  },
});
beforeEach(()=>{
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization']
})
const setup = (path) => {
    const store = configureStore(false);
    return render (
       <Provider store={store}>
         <MemoryRouter initialEntries={[path]}>
                 <App/>
         </MemoryRouter>
       </Provider>

    );

}
describe('App', ()=>{
    const changeEvent = (content) => {
        return {
            target: {
                value: content
              }
            };
    };
    it('displays homepage when url is /', ()=>{
        const { queryByTestId } = setup('/');
        expect( queryByTestId('homepage')).toBeInTheDocument();
    });

    it('displays loginPage when url is /login', ()=>{
        const { container } = setup('/Login');
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Login');
    });

    it('displays only loginPage when url is /login', ()=>{
        const { queryByTestId } = setup('/Login');
        expect(queryByTestId('homepage')).not.toBeInTheDocument();
    });

    it('displays signUpPage when url is /signup', ()=>{
        const { container } = setup('/Signup');
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Sign Up');
    });

    it('displays UserPage when url is other than /. /signup or /login', ()=>{
        const { queryByTestId } = setup('/user1');
        expect( queryByTestId('userpage')).toBeInTheDocument();
    });

    it('displays My profile on topBar after login success', async()=>{
        const { queryByPlaceholderText, container } = setup('/login');
        const usernameInput = queryByPlaceholderText('Your username');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data: {
                id:1,
                username: 'user1',
                displayName:'display1',
                image:'profile.png'
            }
        });
        fireEvent.click(button);
        const myProfileLink = await waitFor(() => screen.getByText('My Profile'));
        expect(myProfileLink).toBeInTheDocument();

    });

    it('displays My profile on topBar after signup success', async()=>{
        const { queryByPlaceholderText, container, queryByText} = setup('/Signup');
        const displayNameInput = queryByPlaceholderText('Your display name');
        const userNameInput = queryByPlaceholderText('Your username');
        const passwordInput = queryByPlaceholderText('Your password');
        const repeatPassword = queryByPlaceholderText('Repeat your password');

        fireEvent.change(displayNameInput, changeEvent('display1'));
        fireEvent.change(userNameInput, changeEvent('user1'));
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        fireEvent.change(repeatPassword, changeEvent('P4ssword'));

        const button = container.querySelector('button');
        axios.post = jest.fn()
                         .mockResolvedValue({
                            data : {
                                message: "User Saved"
                            }
                         })
                         .mockResolvedValueOnce({
                            data : {
                                id : 1,
                                username : 'user1',
                                displayName : 'display1',
                                image:'profile.png'
                            }
                         });
        fireEvent.click(button);
        const myProfileLink = await screen.findByText('My Profile');
        expect(myProfileLink).toBeInTheDocument();
    });
    it('saves logged in user data to localStorage after login success', async()=>{
        const { queryByPlaceholderText, container } = setup('/login');
        const usernameInput = queryByPlaceholderText('Your username');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data: {
                id:1,
                username: 'user1',
                displayName:'display1',
                image:'profile.png'
            }
        });
        fireEvent.click(button);
        await waitFor(() => screen.getByText('My Profile'))
        const dataInStorage = JSON.parse(localStorage.getItem('hoax-auth'));
        expect(dataInStorage).toEqual({
            id:1,
            username: 'user1',
            displayName:'display1',
            image:'profile.png',
            password: 'P4ssword',
            isLoggedIn: true
        });

    });

    it('displays logged in topBar when storage has logged in user data', ()=>{
        localStorage.setItem(
            'hoax-auth',
            JSON.stringify({
              id:1,
              username: 'user1',
              displayName:'display1',
              image:'profile.png',
              password: 'P4ssword',
              isLoggedIn: true
            })
        );
        const { queryByText } = setup("/");
        const myProfileLink = queryByText('My Profile');
        expect(myProfileLink).toBeInTheDocument();
    });

    it('sets axios authorization with base64 encoded user credentials after login success', async()=>{
        const { queryByPlaceholderText, container } = setup('/login');
        const usernameInput = queryByPlaceholderText('Your username');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your password');
        fireEvent.change(passwordInput, changeEvent('P4ssword'));
        const button = container.querySelector('button');
        axios.post = jest.fn().mockResolvedValue({
            data: {
                id:1,
                username: 'user1',
                displayName:'display1',
                image:'profile.png'
            }
        });
        fireEvent.click(button);
        await waitFor(() => screen.getByText('My Profile'))
        const axiosAuthorizaion = axios.defaults.headers.common["Authorization"];
        const encoded = btoa("user1:P4ssword");
        const expectedAuthorization = `Basic ${encoded}`;
        expect(axiosAuthorizaion).toBe(expectedAuthorization);
    });

    it('sets axios authorization with base64 encoded user credentials when storage has logged in user data', ()=>{
        localStorage.setItem(
            'hoax-auth',
            JSON.stringify({
              id:1,
              username: 'user1',
              displayName:'display1',
              image:'profile.png',
              password: 'P4ssword',
              isLoggedIn: true
            })
        );
        setup('/')
        const axiosAuthorizaion = axios.defaults.headers.common["Authorization"];
        const encoded = btoa("user1:P4ssword");
        const expectedAuthorization = `Basic ${encoded}`;
        expect(axiosAuthorizaion).toBe(expectedAuthorization);
    });

    it('removes axios authorization header when user logout', ()=>{
        setUserOneLoggedInStorage();
        const { queryByText } = setup('/');
        fireEvent.click(queryByText('Logout'));
        const axiosAuthorizaion = axios.defaults.headers.common["Authorization"];
        expect(axiosAuthorizaion).toBeFalsy();
    });

    it('updates user page after clicking my profile when another user page was opened', async () => {
        apiCalls.getUser = jest
        .fn()
        .mockResolvedValueOnce(mockSuccessGetUser2)
        .mockResolvedValueOnce(mockSuccessGetUser1);

        setUserOneLoggedInStorage();
        const { queryByText, findByText } = setup('/user2');

        await findByText('display2@user2');

        const myProfileLink = queryByText('My Profile');
        fireEvent.click(myProfileLink);
        const user1Info = await findByText('display1@user1');
        expect(user1Info).toBeInTheDocument();
    });

    it('updates user page after clicking my profile when another non existing user page was opened', async () => {
        apiCalls.getUser = jest
        .fn()
        .mockRejectedValueOnce(mockFailGetUser)
        .mockResolvedValueOnce(mockSuccessGetUser1);

        setUserOneLoggedInStorage();
        const { queryByText, findByText } = setup('/user50');

        await findByText('User Not Found');

        const myProfileLink = queryByText('My Profile');
        fireEvent.click(myProfileLink);
        const user1Info = await findByText('display1@user1');
        expect(user1Info).toBeInTheDocument();
  });

})