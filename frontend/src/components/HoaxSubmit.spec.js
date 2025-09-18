import React from "react";
import {render, fireEvent, queryByText, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom';
import HoaxSubmit from './HoaxSubmit';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';
import * as apiCalls from '../api/apiCalls'
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
          <HoaxSubmit/>
        </Provider>
    );
}
describe('HoaxSubmit', () => {
    describe('Layout', () => {
        it("has textarea", () => {
            const { container } = setup();
            const textArea = container.querySelector('textarea')
            expect(textArea).toBeInTheDocument();
        });
        it("has image", () => {
            const { container } = setup();
            const image = container.querySelector('img')
            expect(image).toBeInTheDocument();
        });
        it("displays user image", () => {
            const { container } = setup();
            const image = container.querySelector('img')
            expect(image.src).toContain("/images/profile/" + defaultState.image);
        });
    });
    describe('Interactions', () => {
        let textArea;
        const setupFocused = () => {
        const rendered = setup();
        textArea = rendered.container.querySelector('textarea');
        fireEvent.focus(textArea);
        return rendered;
        };
        it("displays 3 rows when focused to textArea", () => {
            const { container } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            expect(textArea.rows).toBe(3);
        });
        it("returns back to unfocused state after clicking the cancel", () => {
            const { container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            const cancelButton = queryByText('Cancel');
            fireEvent.click(cancelButton);
            expect(queryByText('Cancel')).not.toBeInTheDocument();
        });
        it("calls postHoax with hoax request Object when clicking hoaxify", () => {
            const { container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: "Test hoax content"}})
            const hoaxifyButton = queryByText('Hoaxify');
            apiCalls.postHoax = jest.fn().mockResolvedValue({});
            fireEvent.click(hoaxifyButton);
            expect(apiCalls.postHoax).toHaveBeenCalledWith({
                content: 'Test hoax content'
            });
        });
        it("disables hoaxify button when there is postHoax api call", async() => {
            const { container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: "Test hoax content"}})
            const hoaxifyButton = queryByText('Hoaxify');
            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300)
                });
            });

            apiCalls.postHoax = mockFunction;
            fireEvent.click(hoaxifyButton);
            fireEvent.click(hoaxifyButton);
            expect(mockFunction).toHaveBeenCalledTimes(1);
        });
        it("disables cancel button when there is postHoax api call", async() => {
            const { container, queryByText} = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);
            fireEvent.change(textArea, { target: { value: "Test hoax content"}})
            const hoaxifyButton = queryByText('Hoaxify');
            const mockFunction = jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300)
                });
            });

            apiCalls.postHoax = mockFunction;
            fireEvent.click(hoaxifyButton);
            const cancelButton = queryByText('Cancel');
            expect(cancelButton).toBeDisabled();
        });

        it('displays image component when file selected', async () => {
            apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
              data: {
                id: 1,
                name: 'random-name.png',
              },
            });
            const { container } = setup();
            const textArea = container.querySelector('textarea');
            fireEvent.focus(textArea);

            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');

            const file = new File(['dummy content'], 'example.png', {
               type: 'image/png',
            });
            fireEvent.change(uploadInput, { target: { files: [file] } });

            await waitFor(() => {
              const images = container.querySelectorAll('img');
              const attachmentImage = images[1];
              expect(attachmentImage.src).toContain('data:image/png;base64');
            });
        });
        it('removes selected image after clicking cancel', async () => {
            apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
              data: {
              id: 1,
              name: 'random-name.png',
             },
            });
            const { queryByText, container } = setupFocused();

            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');

            const file = new File(['dummy content'], 'example.png', {
              type: 'image/png',
            });
            fireEvent.change(uploadInput, { target: { files: [file] } });

            await waitFor(() => {
              const images = container.querySelectorAll('img');
              expect(images.length).toBe(2);
            });

            fireEvent.click(queryByText('Cancel'));
            fireEvent.focus(textArea);

            await waitFor(() => {
              const images = container.querySelectorAll('img');
              expect(images.length).toBe(1);
            });
        });
        it('calls postHoaxFile when file selected', async () => {
            apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
             data: {
               id: 1,
               name: 'random-name.png',
             },
            });

            const { container } = setupFocused();
            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');

            const file = new File(['dummy content'], 'example.png', {
               type: 'image/png',
            });
            fireEvent.change(uploadInput, { target: { files: [file] } });

            await waitFor(() => {
               const images = container.querySelectorAll('img');
               expect(images.length).toBe(2);
            });
            expect(apiCalls.postHoaxFile).toHaveBeenCalledTimes(1);
        });
        it('calls postHoaxFile with selected file', async () => {
            apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
              data: {
                id: 1,
                name: 'random-name.png',
              },
            });

            const { container } = setupFocused();

            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');

            const file = new File(['dummy content'], 'example.png', {
                type: 'image/png',
            });
            fireEvent.change(uploadInput, { target: { files: [file] } });

            await waitFor(() => {
               const images = container.querySelectorAll('img');
               expect(images.length).toBe(2);
            });

            const body = apiCalls.postHoaxFile.mock.calls[0][0];

            const readFile = () => {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();

              reader.onloadend = () => {
                resolve(reader.result);
              };
              reader.readAsText(body.get('file'));
              });
            };

            const result = await readFile();

            expect(result).toBe('dummy content');
        });
        it('calls postHoax with hoax with file attachment object when clicking Hoaxify', async () => {
            apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
            data: {
              id: 1,
              name: 'random-name.png',
             },
            });
            const { queryByText, container } = setupFocused();
            fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

            const uploadInput = container.querySelector('input');
            expect(uploadInput.type).toBe('file');

            const file = new File(['dummy content'], 'example.png', {
            type: 'image/png',
            });
            fireEvent.change(uploadInput, { target: { files: [file] } });

            await waitFor(() => {
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(2);
            });

            const hoaxifyButton = queryByText('Hoaxify');

            apiCalls.postHoax = jest.fn().mockResolvedValue({});
            fireEvent.click(hoaxifyButton);

            expect(apiCalls.postHoax).toHaveBeenCalledWith({
            content: 'Test hoax content',
            attachment: {
              id: 1,
              name: 'random-name.png',
             },
            });
        });
        it('clears image after postHoax success', async () => {
          apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png',
           },
          });
          const { queryByText, container } = setupFocused();
          fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

          const uploadInput = container.querySelector('input');
          expect(uploadInput.type).toBe('file');

          const file = new File(['dummy content'], 'example.png', {
            type: 'image/png',
          });
          fireEvent.change(uploadInput, { target: { files: [file] } });

          await waitFor(() => {
             const images = container.querySelectorAll('img');
             expect(images.length).toBe(2);
          });

          const hoaxifyButton = queryByText('Hoaxify');

          apiCalls.postHoax = jest.fn().mockResolvedValue({});
          fireEvent.click(hoaxifyButton);

          fireEvent.focus(textArea);
          await waitFor(() => {
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(1);
          });
        });
        it('calls postHoax without file attachment after cancelling previous file selection', async () => {
          apiCalls.postHoaxFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png',
           },
           });
          const { queryByText, container } = setupFocused();
          fireEvent.change(textArea, { target: { value: 'Test hoax content' } });

          const uploadInput = container.querySelector('input');
          expect(uploadInput.type).toBe('file');

          const file = new File(['dummy content'], 'example.png', {
            type: 'image/png',
          });
          fireEvent.change(uploadInput, { target: { files: [file] } });

          await waitFor(() => {
            const images = container.querySelectorAll('img');
            expect(images.length).toBe(2);
          });
          fireEvent.click(queryByText('Cancel'));
          fireEvent.focus(textArea);

          const hoaxifyButton = queryByText('Hoaxify');

          apiCalls.postHoax = jest.fn().mockResolvedValue({});
          fireEvent.change(textArea, { target: { value: 'Test hoax content' } });
          fireEvent.click(hoaxifyButton);

          expect(apiCalls.postHoax).toHaveBeenCalledWith({
          content: 'Test hoax content',
          });
        });
    })
})