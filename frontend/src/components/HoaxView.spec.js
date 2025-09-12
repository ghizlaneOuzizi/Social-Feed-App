import React from "react";
import {render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom';
import HoaxView from "./HoaxView";
import { MemoryRouter } from 'react-router-dom'
import * as apiCalls from '../api/apiCalls'
setup = ()=>{
    const oneMinute = 60*1000;
    const date = new Date(new Date() - oneMinute);
    const hoax = {
        id: 10,
        content: 'This is the first hoax',
        date: date,
        user:{
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile.png'
            }
        };
    return render(
       <MemoryRouter>
        <HoaxView hoax={hoax}/>
       </MemoryRouter>);
};

describe('HoaxView', () => {
    describe('Layout', () => {
        it("displays hoax content", () => {
           const { queryByText } = setup();
           expect(queryByText("This is the first hoax")).toBeInTheDocument();
        });
        it("displays users image", () => {
           const { container } = setup();
           const image = container.querySelector('img');
           expect(image.src).toContain("/images/profile/profile.png");
        });
        it("displays relative time", () => {
           const { queryByText } = setup();
           expect(queryByText("1 minute ago")).toBeInTheDocument();
        });
    })
})