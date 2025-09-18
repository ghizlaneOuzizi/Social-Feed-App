import React from "react";
import {render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom';
import HoaxView from "./HoaxView";
import { MemoryRouter } from 'react-router-dom'
import * as apiCalls from '../api/apiCalls'
const hoaxWithoutAttachment = {
        id: 10,
        content: 'This is the first hoax',
        user:{
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile.png'
            }
        };
const hoaxWithAttachment = {
        id: 10,
        content: 'This is the first hoax',
        user:{
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile.png'
            },
        attachment:{
            fileType: 'image/png',
            name: 'attached-image.png'
        }
    };
const hoaxWithPdfAttachment = {
        id: 10,
        content: 'This is the first hoax',
        user:{
            id: 1,
            username: 'user1',
            displayName: 'display1',
            image: 'profile.png'
            },
        attachment:{
            fileType: 'application/pdf',
            name: 'attached.pdf'
        }
    };
setup = (hoax = hoaxWithoutAttachment) => {
    const oneMinute = 60*1000;
    const date = new Date(new Date() - oneMinute);
    hoax.date = date;
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
        it("displays file attachment image", () => {
           const { container } = setup(hoaxWithAttachment);
           const images = container.querySelectorAll('img');
           expect(images.length).toBe(2);
        });
        it("does not displays file attachment when attachment type is not image", () => {
           const { container } = setup(hoaxWithPdfAttachment);
           const images = container.querySelectorAll('img');
           expect(images.length).toBe(1);
        });
        it('sets the attachment path as source for file attachment image', () => {
           const { container } = setup(hoaxWithAttachment);
           const images = container.querySelectorAll('img');
           const attachmentImage = images[1];
           expect(attachmentImage.src).toContain(
              '/images/attachements/' + hoaxWithAttachment.attachment.name
      );
    });
    })
})