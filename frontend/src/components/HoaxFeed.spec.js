import React from "react";
import {render, waitFor, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom';
import HoaxFeed from './HoaxFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';

const loggedInStateUser1 = {
  id: 1,
  username: 'user1',
  displayName: 'display1',
  image: 'profile1.png',
  password: 'P4ssword',
  isLoggedIn: true,
};
const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
  window.setInterval = (callback, interval) => {
    if (!callback.toString().startsWith('function')) {
      timedFunction = callback;
      return 111111;
    }
  };
  window.clearInterval = (id) => {
    if (id === 111111) {
      timedFunction = undefined;
    }
  };
};

const useRealIntervals = () => {
  window.setInterval = originalSetInterval;
  window.clearInterval = originalClearInterval;
};

const runTimer = () => {
  timedFunction && timedFunction();
};
const setup = (props, state = loggedInStateUser1) => {
    const store = createStore(authReducer, state);
    return render(
     <Provider store={store}>
       <MemoryRouter>
         <HoaxFeed {...props} />
       </MemoryRouter>
     </Provider>
    );
};
const mockSuccessGetHoaxesSinglePage= {
        data: {
            content : [
                {
                    id: 10,
                    content: 'This is the latest hoax',
                    date: 1757424984,
                    user:{
                        id: 1,
                        username: 'user1',
                        displayName: 'display1',
                        image: 'profile.png'
                    }
                }
            ],
            number: 0,
            first: true,
            last: true,
            size: 5,
            totalPages : 1
        }
    };
const mockSuccessGetHoaxesFirstMultiPage= {
        data: {
            content : [
                {
                    id: 10,
                    content: 'This is the latest hoax',
                    date: 1757424984,
                    user:{
                        id: 1,
                        username: 'user1',
                        displayName: 'display1',
                        image: 'profile.png'
                    }
                },
                {
                    id: 9,
                    content: 'This is hoax 9',
                    date: 1757887725,
                    user:{
                        id: 1,
                        username: 'user1',
                        displayName: 'display1',
                        image: 'profile.png'
                    }
                }
            ],
            number: 0,
            first: true,
            last: false,
            size: 5,
            totalPages : 2
        }
    };
const mockSuccessGetHoaxesLastOfMultiPage= {
        data: {
            content : [
                {
                    id: 1,
                    content: 'This is the oldest hoax',
                    date: 1757424984,
                    user:{
                        id: 1,
                        username: 'user1',
                        displayName: 'display1',
                        image: 'profile.png'
                    }
                }
            ],
            number: 0,
            first: true,
            last: true,
            size: 5,
            totalPages : 2
        }
};
const mockSuccessGetNewHoaxesList = {
  data: [
    {
      id: 21,
      content: 'This is the newest hoax',
      date: 1561294668539,
      user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png',
      },
    },
  ],
};
const mockEmptyResponse = {
    data : {
        content : []
    }
}
describe('HoaxSubmit', () => {
    describe('Lifecycle', () => {
        it("calls loadHoaxes when it is rendered", () => {
           apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
           setup();
           expect(apiCalls.loadHoaxes).toHaveBeenCalled();
        });
        it("calls loadHoaxes with user parameter when it is rendered with user property", () => {
           apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
           setup({user: "user1"});
           expect(apiCalls.loadHoaxes).toHaveBeenCalledWith("user1");
        });
        it("calls loadHoaxes without user parameter when it is rendered with user property", () => {
           apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
           setup();
           const parameter = apiCalls.loadHoaxes.mock.calls[0][0];
           expect(parameter).toBeUndefined();
        });
        it('calls loadNewHoaxCount with topHoax id', async () => {
          useFakeIntervals();
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });
          const { findByText } = setup();
          await findByText('This is the latest hoax');
          runTimer();
          await findByText('There is 1 new hoax');
          const firstParam = apiCalls.loadNewHoaxCount.mock.calls[0][0];
          expect(firstParam).toBe(10);
          useRealIntervals();
        });
        it('displays new hoax count as 1 after loadNewHoaxCount success', async () => {
          useFakeIntervals();
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });
          const { findByText } = setup({ user: 'user1' });
          await findByText('This is the latest hoax');
          runTimer();
          const newHoaxCount = await findByText('There is 1 new hoax');
          expect(newHoaxCount).toBeInTheDocument();
          useRealIntervals();
        });
        it('displays new hoax count constantly', async () => {
          useFakeIntervals();
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });
          const { findByText } = setup({ user: 'user1' });
          await findByText('This is the latest hoax');
          runTimer();
          await findByText('There is 1 new hoax');
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 2 } });
          runTimer();
          const newHoaxCount = await findByText('There are 2 new hoaxes');
          expect(newHoaxCount).toBeInTheDocument();
          useRealIntervals();
        });
        it('does not call loadNewHoaxCount after component is unmounted', async () => {
          useFakeIntervals();
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });
          const { findByText, unmount } = setup({ user: 'user1' });
          await findByText('This is the latest hoax');
          runTimer();
          await findByText('There is 1 new hoax');
          unmount();
          expect(apiCalls.loadNewHoaxCount).toHaveBeenCalledTimes(1);
          useRealIntervals();
        });

    });
    describe('Layout', () => {
        it("does not display no hoax message when the response has page of hoax", async() => {
           apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesSinglePage);
           const { queryByText } = setup();
           await waitFor(() => {
               expect(queryByText('There are no Hoaxes')).not.toBeInTheDocument();
           });
        });
        it("displays Load More when there are next pages", async() => {
           apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
           const { findByText } = setup();
           const loadMore = await waitFor(() =>(
             findByText("Load More")
           ))
           expect(loadMore).toBeInTheDocument();
        });
    })
    describe('Interactions', () => {
        it('calls loadOldHoaxes with hoax id when clicking Load More', async () => {
            apiCalls.loadHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
            apiCalls.loadOldHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
            const { findByText } = setup();
            const loadMore = await findByText('Load More');
            fireEvent.click(loadMore);
            const firstParam = apiCalls.loadOldHoaxes.mock.calls[0][0];
            expect(firstParam).toBe(9);
        });
        it('calls loadOldHoaxes with hoax id and username when clicking Load More when rendered with user property', async () => {
            apiCalls.loadHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
            apiCalls.loadOldHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
            const { findByText } = setup({ user: 'user1' });
            const loadMore = await findByText('Load More');
            fireEvent.click(loadMore);
            expect(apiCalls.loadOldHoaxes).toHaveBeenCalledWith(9, 'user1');
        });
        it('displays loaded old hoax when loadOldHoaxes api call success', async () => {
            apiCalls.loadHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
            apiCalls.loadOldHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
            const { findByText } = setup();
            const loadMore = await findByText('Load More');
            fireEvent.click(loadMore);
            const oldHoax = await findByText('This is the oldest hoax');
            expect(oldHoax).toBeInTheDocument();
        });
        it('hides Load More when loadOldHoaxes api call returns last page', async () => {
            apiCalls.loadHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
            apiCalls.loadOldHoaxes = jest
              .fn()
              .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
            const { findByText } = setup();
            const loadMore = await findByText('Load More');
            fireEvent.click(loadMore);
            await waitFor(() => {
               expect(loadMore).not.toBeInTheDocument();
            });
        });
        it('calls loadNewHoaxes with hoax id when clicking New Hoax Count Card', async () => {
            useFakeIntervals();
            apiCalls.loadHoaxes = jest
             .fn()
             .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
            apiCalls.loadNewHoaxCount = jest
             .fn()
             .mockResolvedValue({ data: { count: 1 } });
            apiCalls.loadNewHoaxes = jest
             .fn()
             .mockResolvedValue(mockSuccessGetNewHoaxesList);
            const { findByText } = setup();
            await findByText('This is the latest hoax');
            runTimer();
            const newHoaxCount = await findByText('There is 1 new hoax');
            fireEvent.click(newHoaxCount);
            const firstParam = apiCalls.loadNewHoaxes.mock.calls[0][0];
            expect(firstParam).toBe(10);
            useRealIntervals();
        });
        it('calls loadNewHoaxes with hoax id and username when clicking New Hoax Count Card', async () => {
          useFakeIntervals();
          apiCalls.loadHoaxes = jest
           .fn()
           .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
           .fn()
           .mockResolvedValue({ data: { count: 1 } });
          apiCalls.loadNewHoaxes = jest
           .fn()
           .mockResolvedValue(mockSuccessGetNewHoaxesList);
          const { findByText } = setup({ user: 'user1' });
          await findByText('This is the latest hoax');
          runTimer();
          const newHoaxCount = await findByText('There is 1 new hoax');
          fireEvent.click(newHoaxCount);
          expect(apiCalls.loadNewHoaxes).toHaveBeenCalledWith(10, 'user1');
          useRealIntervals();
        });
        it('displays loaded new hoax when loadNewHoaxes api call success', async () => {
          useFakeIntervals();
          apiCalls.loadHoaxes = jest
           .fn()
           .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
           .fn()
           .mockResolvedValue({ data: { count: 1 } });
          apiCalls.loadNewHoaxes = jest
           .fn()
           .mockResolvedValue(mockSuccessGetNewHoaxesList);
          const { findByText } = setup({ user: 'user1' });
          await findByText('This is the latest hoax');
          runTimer();
          const newHoaxCount = await findByText('There is 1 new hoax');
          fireEvent.click(newHoaxCount);
          const newHoax = await findByText('This is the newest hoax');
          expect(newHoax).toBeInTheDocument();
          useRealIntervals();
        });
        it('hides new hoax count when loadNewHoaxes api call success', async () => {
          useFakeIntervals();
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });
          apiCalls.loadNewHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetNewHoaxesList);
          const { findByText, queryByText } = setup({ user: 'user1' });
          await findByText('This is the latest hoax');
          runTimer();
          const newHoaxCount = await findByText('There is 1 new hoax');
          fireEvent.click(newHoaxCount);
          await findByText('This is the newest hoax');
          expect(queryByText('There is 1 new hoax')).not.toBeInTheDocument();
          useRealIntervals();
        });
        xit('does not allow loadOldHoaxes to be called when there is an active api call about it', async () => {
          apiCalls.loadHoaxes = jest
           .fn()
           .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadOldHoaxes = jest
           .fn()
           .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
          const { findByText } = setup();
          fireEvent.click(await findByText('Load More'));
          fireEvent.click(await findByText('Load More'));
          expect(apiCalls.loadOldHoaxes).toHaveBeenCalledTimes(1);
        });
        it('replaces Load More with spinner when there is an active api call about it', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadOldHoaxes = jest.fn().mockImplementation(() => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(mockSuccessGetHoaxesLastOfMultiPage);
              }, 300);
            });
          });
          const { queryByText, findByText } = setup();
          const loadMore = await findByText('Load More');
          fireEvent.click(loadMore);
          const spinner = await findByText('Loading...');
          expect(spinner).toBeInTheDocument();
          expect(queryByText('Load More')).not.toBeInTheDocument();
        });
        it('displays modal when clicking delete on hoax', async () => {
          apiCalls.loadHoaxes = jest
           .fn()
           .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
           .fn()
           .mockResolvedValue({ data: { count: 1 } });
          const { queryByTestId, container, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);

          const modalRootDiv = queryByTestId('modal-root');
          expect(modalRootDiv).toHaveClass('modal fade d-block show');
        });
        it('hides modal when clicking cancel', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });
          const { queryByTestId, container, queryByText, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);

          fireEvent.click(queryByText('Cancel'));

          const modalRootDiv = queryByTestId('modal-root');
          expect(modalRootDiv).not.toHaveClass('d-block show');
        });
        it('displays modal with information about the action', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });
          const { container, queryByText, findByText } = setup();
          await findByText('This is the oldest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);

          const message = queryByText(
             `Are you sure to delete 'This is the oldest hoax'?`
          );
          expect(message).toBeInTheDocument();
        });
        it('calls deleteHoax api with hoax id when delete button is clicked on modal', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });

          apiCalls.deleteHoax = jest.fn().mockResolvedValue({});
          const { container, queryByText, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);
          const deleteHoaxButton = queryByText('Delete Hoax');
          fireEvent.click(deleteHoaxButton);
          expect(apiCalls.deleteHoax).toHaveBeenCalledWith(10);
        });
        it('hides modal after successful deleteHoax api call', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });

          apiCalls.deleteHoax = jest.fn().mockResolvedValue({});
          const { container, queryByText, queryByTestId, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);
          const deleteHoaxButton = queryByText('Delete Hoax');
          fireEvent.click(deleteHoaxButton);
          await waitFor(() => {
            const modalRootDiv = queryByTestId('modal-root');
            expect(modalRootDiv).not.toHaveClass('d-block show');
          });
        });
        it('removes the deleted hoax from document after successful deleteHoax api call', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });

          apiCalls.deleteHoax = jest.fn().mockResolvedValue({});
          const { container, queryByText, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);
          const deleteHoaxButton = queryByText('Delete Hoax');
          fireEvent.click(deleteHoaxButton);
          await waitFor(() => {
             const deletedHoaxContent = queryByText('This is the latest hoax');
             expect(deletedHoaxContent).not.toBeInTheDocument();
          });
        });
        it('disables Modal Buttons when api call in progress', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });

          apiCalls.deleteHoax = jest.fn().mockImplementation(() => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve({});
              }, 300);
            });
          });
          const { container, queryByText, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);
          const deleteHoaxButton = queryByText('Delete Hoax');
          fireEvent.click(deleteHoaxButton);

          expect(deleteHoaxButton).toBeDisabled();
          expect(queryByText('Cancel')).toBeDisabled();
        });
        it('displays spinner when api call in progress', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });

          apiCalls.deleteHoax = jest.fn().mockImplementation(() => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve({});
              }, 300);
            });
          });
          const { container, queryByText, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);
          const deleteHoaxButton = queryByText('Delete Hoax');
          fireEvent.click(deleteHoaxButton);
          const spinner = queryByText('Loading...');
          expect(spinner).toBeInTheDocument();
        });
        it('hides spinner when api call finishes', async () => {
          apiCalls.loadHoaxes = jest
            .fn()
            .mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
          apiCalls.loadNewHoaxCount = jest
            .fn()
            .mockResolvedValue({ data: { count: 1 } });

          apiCalls.deleteHoax = jest.fn().mockImplementation(() => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve({});
              }, 300);
            });
          });
          const { container, queryByText, findByText } = setup();
          await findByText('This is the latest hoax');
          const deleteButton = container.querySelectorAll('button')[0];
          fireEvent.click(deleteButton);
          const deleteHoaxButton = queryByText('Delete Hoax');
          fireEvent.click(deleteHoaxButton);
          await waitFor(() => {
             const spinner = queryByText('Loading...');
             expect(spinner).not.toBeInTheDocument();
          });
        });
    })
})

console.error = () => {};