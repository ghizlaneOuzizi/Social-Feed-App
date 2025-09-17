import React from "react";
import {render, waitFor, fireEvent} from "@testing-library/react";
import '@testing-library/jest-dom';
import HoaxFeed from './HoaxFeed';
import * as apiCalls from '../api/apiCalls'
import { MemoryRouter } from 'react-router-dom'
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
const setup = (props) => {
    return render(
      <MemoryRouter>
        <HoaxFeed {...props} />
      </MemoryRouter> );
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
    })
})