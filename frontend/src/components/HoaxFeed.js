import React from "react";
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import HoaxView from "./HoaxView";
class HoaxFeed extends React.Component{

    state = {
        page: {
            content : []
        },
        isLoadingHoaxes : false,
        newHoaxCount : 0,
        isLoadingOldHoaxes: false,
        isLoadingNewHoaxes : false
    };
    componentDidMount(){
        this.setState({ isLoadingHoaxes: true});
        apiCalls.loadHoaxes( this.props.user ).then((response) => {
            this.setState(
                { page: response.data, isLoadingHoaxes: false},
                ()=>{
                    this.counter = setInterval(this.checkCount, 3000)
                }
            );
        });
    }

    componentWillUnmount(){
        clearInterval(this.counter)
    }
    checkCount = () => {
        let hoaxes = [];
        let topHoaxId = 0;
        if (this.state.page && Array.isArray(this.state.page.content)) {
        hoaxes = this.state.page.content;
        } else if (Array.isArray(this.state.page)) {
          hoaxes = this.state.page;
        }
        if(hoaxes.length === 0 ){
            return;
        }
        if(hoaxes.length > 0){
            topHoaxId = hoaxes[0].id;
        }
        apiCalls
          .loadNewHoaxCount(topHoaxId, this.props.user)
          .then(response => {
            this.setState({ newHoaxCount : response.data.count })
            console.log("API response", response.data);

          })
    }

    onClickLoadMore = () => {
        let hoaxes = [];
        if (this.state.page && Array.isArray(this.state.page.content)) {
        hoaxes = this.state.page.content;
        } else if (Array.isArray(this.state.page)) {
          hoaxes = this.state.page;
        }
        if(hoaxes.length === 0){
            return ;
        }
        const hoaxAtBottom = hoaxes[hoaxes.length - 1];
        this.setState({isLoadingOldHoaxes : true})
        apiCalls
          .loadOldHoaxes(hoaxAtBottom.id, this.props.user)
          .then((response) => {
            let newContent = [];
            let isLast = true;

            if (response.data && Array.isArray(response.data.content)) {
              newContent = response.data.content;
              isLast = response.data.last;
             } else if (Array.isArray(response.data)) {
              newContent = response.data;
              isLast = true;
             }
            const page = { ...this.state.page };
            page.content = [...hoaxes, ...newContent];
            page.last = isLast;
            console.log(response.data);

            this.setState({ page, isLoadingOldHoaxes: false });
          }).catch((error) =>{
            this.setState({ isLoadingOldHoaxes : false})
          });
        }
    onClickLoadNew = () => {
        let hoaxes = [];
        let topHoaxId = 0;
        if (this.state.page && Array.isArray(this.state.page.content)) {
        hoaxes = this.state.page.content;
        } else if (Array.isArray(this.state.page)) {
          hoaxes = this.state.page;
        }
        if(hoaxes.length === 0 ){
            return;
        }
        if(hoaxes.length > 0){
            topHoaxId = hoaxes[0].id;
        }
        apiCalls.loadNewHoaxes(topHoaxId, this.props.user)
        .then((response) => {
            const page = { ...this.state.page };
            console.log(response.data.content);
            page.content = [...response.data, ...page.content];
            this.setState({ page, newHoaxCount : 0, isLoadingNewHoaxes : false });
        }).catch((error) => {
             this.setState({ isLoadingNewHoaxes: false});
        });
    }
    render(){
        if(this.state.isLoadingHoaxes){
            return (
             <Spinner />
            )
        }
        if(this.state.page.content.length === 0 && this.state.newHoaxCount === 0){
            return (
               <div className="card card-header text-center">
                There are no Hoaxes</div>
            );
        }
        let content = [];
        if (this.state.page && Array.isArray(this.state.page.content)) {
            content = this.state.page.content;
        }
        else if (Array.isArray(this.state.page)) {
            content = this.state.page;
        }
        else {
         content = [];
        }
        const newHoaxCountMessage = this.state.newHoaxCount === 1
                   ? 'There is 1 new hoax'
                   : `There are ${this.state.newHoaxCount} new hoaxes`;
        return (<div>
            { this.state.newHoaxCount > 0 && (
                <div className="card card-header text-center"
                 onClick={!this.state.isLoadingNewHoaxes && this.onClickLoadNew}
                 style = {{cursor : this.state.isLoadingNewHoaxes?'not-allowed':'pointer'}}
                >
                 {this.state.isLoadingNewHoaxes ? <Spinner/> : newHoaxCountMessage}
                </div>
            )}
            {content.map((hoax) => {
                return (
                 <div className="mb-4">
                 <HoaxView key={hoax.id} hoax={hoax} />
                 </div>);
            })}
            {this.state.page && this.state.page.last === false &&
             <div
               className="card card-header text-center"
               onClick={!this.state.isLoadingOldHoaxes && this.onClickLoadMore}
               style={{ cursor: this.state.isLoadingOldHoaxes ? 'not-allowed' : 'pointer'}}
               >
                {this.state.isLoadingOldHoaxes ? <Spinner/> : 'Load More'}
            </div>}
        </div>
        );
    }
}
export default HoaxFeed;
