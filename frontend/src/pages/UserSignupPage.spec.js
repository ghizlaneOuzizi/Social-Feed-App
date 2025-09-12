import React from "react";
import {render, screen, fireEvent, waitForElementToBeRemoved, waitFor, queryByText} from "@testing-library/react";
import '@testing-library/jest-dom';
import {UserSignupPage} from './UserSignupPage';
describe('UserSignupPage', () => {
    describe('Layout', ()=>{
        it('has header of sign up' , () => {
            render(<UserSignupPage />); // No need to destructure render result
            const header = screen.getByRole("heading", { level: 1 }); // Using screen API
            expect(header).toHaveTextContent("Sign Up");
        });
        it('has input for display name', () =>{
            render(<UserSignupPage />);
            const displayNameInput = screen.queryByPlaceholderText('Your display name');
            expect(displayNameInput).toBeInTheDocument();
        });
        it('has input for username', () =>{
            render(<UserSignupPage />);
            const userNameInput = screen.queryByPlaceholderText('Your username');
            expect(userNameInput).toBeInTheDocument();
        });
        it('has input for password', () =>{
            render(<UserSignupPage />);
            const passwordInput = screen.getByPlaceholderText('Your password');
            expect(passwordInput).toBeInTheDocument();
        });
        it('has password type for password input', () =>{
            render(<UserSignupPage />);
            const passwordInput = screen.getByPlaceholderText("Your password");
            expect(passwordInput).toHaveAttribute("type", "password");
        });
        it('has input for password repeat', () =>{
            render(<UserSignupPage />);
            const passwordRepeat = screen.getByPlaceholderText('Repeat your password');
            expect(passwordRepeat).toBeInTheDocument();
        });
        it('has password type for password repeat input', () =>{
            render(<UserSignupPage />);
            const passwordRepeat = screen.getByPlaceholderText("Your password");
            expect(passwordRepeat).toHaveAttribute("type", "password");
        });
        it('has submit button', () =>{
            render(<UserSignupPage />);
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });
    describe('Interactions', ()=>{
        const changeEvent = (content) => {
            return {
              target: {
                value: content
            }
          };
        };

        const mockAsyncDelayed = () => {
            return jest.fn().mockImplementation(
                ()=>{
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve({});
                        }, 300)
                    })
                }
            )
        }

        let button, displayNameInput, userNameInput, passwordInput, repeatPassword;
        const setupForSubmit = (props) => {
            render( <UserSignupPage {...props} /> );
            displayNameInput = screen.queryByPlaceholderText('Your display name');
            userNameInput = screen.queryByPlaceholderText('Your username');
            passwordInput = screen.queryByPlaceholderText('Your password');
            repeatPassword = screen.queryByPlaceholderText('Repeat your password');

            fireEvent.change(displayNameInput, changeEvent('my-display-name'));
            fireEvent.change(userNameInput, changeEvent('my-user-name'));
            fireEvent.change(passwordInput, changeEvent('P4ssword'));
            fireEvent.change(repeatPassword, changeEvent('P4ssword'));
            button = screen.getByRole('button');
            fireEvent.click(button);
        }

        it('sets the displayName value into state' , () => {
            render(<UserSignupPage />);
            const displayNameInput = screen.queryByPlaceholderText('Your display name');
            fireEvent.change(displayNameInput, changeEvent('my-display-name'));
            expect(displayNameInput).toHaveValue('my-display-name');
        });

        it('sets the username value into state' , () => {
            render(<UserSignupPage />);
            const userNameInput = screen.queryByPlaceholderText('Your username');
            fireEvent.change(userNameInput, changeEvent('my-user-name'));
            expect(userNameInput).toHaveValue('my-user-name');
        });
        it('sets the password value into state' , () => {
            render(<UserSignupPage />);
            const passwordInput = screen.queryByPlaceholderText('Your password');
            fireEvent.change(passwordInput, changeEvent('P4ssword'));
            expect(passwordInput).toHaveValue('P4ssword');
        });
        it('sets the password repeat value into state' , () => {
            render(<UserSignupPage />);
            const repeatPassword = screen.queryByPlaceholderText('Repeat your password');
            fireEvent.change(repeatPassword, changeEvent('P4ssword'));
            expect(repeatPassword).toHaveValue('P4ssword');
        });
        it('calls postSign when the fields are valid and the actions are provided in prop' , () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            };
            setupForSubmit({actions})
            expect(actions.postSignup).toHaveBeenCalledTimes(1);
        });
        it('does not throw exception when clicking the button when actions not provided in props' , () => {
            setupForSubmit()
            expect(() => fireEvent.click(button)).not.toThrow();
        });
        it('calls post with user body when the fields are valid' , () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            };
            setupForSubmit({ actions });
            fireEvent.click(button);
            const expectedUserObject = {
                username: 'my-user-name',
                displayName: 'my-display-name',
                password: 'P4ssword'
            }
            expect(actions.postSignup).toHaveBeenCalledWith(expectedUserObject) ;
        });

        it('does not allow user to click the sign Up button when there is an ongoing api call', () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            };
            setupForSubmit({ actions });
            fireEvent.click(button);
            fireEvent.click(button);
            expect(actions.postSignup).toHaveBeenCalledTimes(1);
        });
        xit('display spinner when there is an ongoing api call', () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            };
            setupForSubmit({ actions });
            fireEvent.click(button);

            const spinner = screen.queryByText('Loading...');
            expect(spinner).toBeInTheDocument();

        });
        xit('hides spinner after api call finishes successfully', async () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            };
            setupForSubmit({ actions });
            fireEvent.click(button);

            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'))
            const spinner = screen.queryByText('Loading...');
            expect(spinner).not.toBeInTheDocument();


        });

        it('hides spinner after api call finishes with error', async () => {
            const actions = {
                postSignup: jest.fn().mockImplementation(
                    ()=>{
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                reject({
                                    response: { data: {} }
                                });
                            }, 300);
                        });
                    }
                )
            };
            setupForSubmit({ actions });
            fireEvent.click(button);

            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'))
            const spinner = screen.queryByText('Loading...');
            expect(spinner).not.toBeInTheDocument();
        });

        it('displays validation error for displayName when error is received for the field', async () => {
            const actions = {
                postSignup : jest.fn().mockRejectedValue({
                    response : {
                        data : {
                            validationErrors: {
                                displayName : 'Cannot be null'
                            }
                        }
                    }
                })
            }

            setupForSubmit({ actions });
            fireEvent.click(button);
            const errorMessage = await waitFor(() => screen.findByText('Cannot be null'));
            expect(errorMessage).toBeInTheDocument();
        });

        it('disables the signup button when password and repeat password have same value', () => {
           setupForSubmit();
           expect(button).toBeDisabled();
        });

        it('disables the signup button when password repeat does not match the password', () => {
           setupForSubmit();
           fireEvent.change(repeatPassword, changeEvent('new-pass'))
           expect(button).toBeDisabled();
        });

        it('disables the signup button when password does not match the password repeat', () => {
           setupForSubmit();
           fireEvent.change(passwordInput, changeEvent('new-pass'))
           expect(button).toBeDisabled();
        });

        it('disables error style for password repeat input when password repeat mismatch', () => {
           setupForSubmit();
           fireEvent.change(repeatPassword, changeEvent('new-pass'))
           const mismatchWarning = screen.queryByText('Does not match to password')
           expect(mismatchWarning).toBeInTheDocument();
        });

        it('disables error style for password repeat input when password input mismatch', () => {
           setupForSubmit();
           fireEvent.change(passwordInput, changeEvent('new-pass'))
           const mismatchWarning = screen.queryByText('Does not match to password')
           expect(mismatchWarning).toBeInTheDocument();
        });

        it('hides the validation error when user changes the content of display name', async () => {
            const actions = {
                postSignup : jest.fn().mockRejectedValue({
                    response : {
                        data : {
                            validationErrors: {
                                displayName : 'Cannot be null'
                            }
                        }
                    }
                })
            }

            setupForSubmit({ actions });
            fireEvent.click(button);
            await waitFor(() => screen.queryByText('Cannot be null'));
            fireEvent.change(displayNameInput, changeEvent('name updated'))
            const errorMessage = screen.queryByText('Cannot be null');
            expect(errorMessage).not.toBeInTheDocument();
        });

        it('hides the validation error when user changes the content of user name', async () => {
            const actions = {
                postSignup : jest.fn().mockRejectedValue({
                    response : {
                        data : {
                            validationErrors: {
                                username : 'Username cannot be null'
                            }
                        }
                    }
                })
            }

            setupForSubmit({ actions });
            fireEvent.click(button);
            await waitFor(() => screen.queryByText('Username cannot be null'));
            fireEvent.change(userNameInput, changeEvent('name updated'))
            const errorMessage = screen.queryByText('Username cannot be null')
            expect(errorMessage).not.toBeInTheDocument();
        });

        it('hides the validation error when user changes the content of password', async () => {
            const actions = {
                postSignup : jest.fn().mockRejectedValue({
                    response : {
                        data : {
                            validationErrors: {
                                password : 'Cannot be null'
                            }
                        }
                    }
                })
            }

            setupForSubmit({ actions });
            fireEvent.click(button);
            await waitFor(() => screen.queryByText('Cannot be null'));
            fireEvent.change(passwordInput, changeEvent('updated-password'))
            const errorMessage = screen.queryByText('Cannot be null')
            expect(errorMessage).not.toBeInTheDocument();
        });

        it('redirects to homePage after successful signup', async () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValue({})
            };
            const history = {
                push: jest.fn()
            };
            setupForSubmit({ actions, history });
            fireEvent.click(button);
            await waitFor(() => {});
            expect(history.push).toHaveBeenCalledWith('/');
                            });
    });
});

console.error = () => {};