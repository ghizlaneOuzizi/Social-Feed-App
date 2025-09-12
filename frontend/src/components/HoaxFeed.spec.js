import React from "react";
import {render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom';
import HoaxFeed from './HoaxFeed';
import * as apiCalls from '../api/apiCalls'
import { MemoryRouter } from 'react-router-dom'
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
                }
            ],
            number: 0,
            first: true,
            last: false,
            size: 5,
            totalPages : 2
        }
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
})