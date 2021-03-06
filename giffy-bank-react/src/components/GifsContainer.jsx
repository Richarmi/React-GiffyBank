import React, { Component } from 'react';
import GifList from './GifList';
import CreateGif from './CreateGif';
import EditGif from './EditGif';
import MyGifs from './MyGifs';
import { Route } from 'react-router-dom';
import request from 'superagent';



class GifsContainer extends Component {
    constructor() {
        super();

        this.state = {
            myGifs: [],
            gifs: [],
            showEdit: false,
            editGifId: null,
            gifToEdit: {
                url: '',
                description: ''
            },
            gifSearch: {
                search: ''
            },
            selectedGif: null,
            modalIsOpen: false
        }
    }
    componentDidMount() {
        this.getGifs().then((gifs) => {
            this.setState({
                myGifs: gifs.data
            })
        }).catch((err) => {
            console.log(err);
        })
    }
    getGifs = async () => {

        const gifs = await fetch('http://localhost:9000/api/v1/gifs', {
            credentials: 'include',
            method: 'GET'
        });
        const gifsJson = await gifs.json();
        return gifsJson

    }
    addGif = async (gif, e) => {
        e.preventDefault();
        console.log("ADDING A GIF");
        console.log(gif);
        const gifToCreate = {
            "url": gif.images.downsized.url,
            "description": gif.title
        }
        console.log(gifToCreate);
        try {
            const createdGif = await fetch('http://localhost:9000/api/v1/gifs', {
                credentials: 'include',
                method: 'POST',
                body: JSON.stringify(gifToCreate),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const createdGifJson = await createdGif.json();
            this.setState({ myGifs: [...this.state.myGifs, createdGifJson.data] });
            this.props.history.push('/gifs/my-gifs');
        } catch (err) {
            console.log(err)
        } console.log('credentials');


    }
    deleteGif = async (id, e) => {
        console.log(id, ' this is id')
        e.preventDefault();
        try {
            const deleteGif = await fetch('http://localhost:9000/api/v1/gifs/' + id, {
                credentials: 'include',
                method: 'DELETE'
            });
            console.log('inside try')
            const deleteGifJson = await deleteGif.json();
            this.setState({ gifs: this.state.gifs.filter((gif, i) => gif._id !== id) });

        } catch (err) {
            console.log(err, ' error')
        }


    }
    showModal = (id, e) => {
        // i comes before e, when called with bind
        const gifToEdit = this.state.gifs.find((gif) => gif._id === id)
        console.log(gifToEdit, ' gifToEdit')
        this.setState({
            credentials: 'include',
            showEdit: true,
            editGifId: id,
            gifToEdit: gifToEdit
        });
    }
    closeAndEdit = async (e) => {
        e.preventDefault();

        try {
            const editResponse = await fetch('http://localhost:9000/api/v1/gifs/' + this.state.editGifId, {
                credentials: 'include',
                method: 'PUT',
                body: JSON.stringify(this.state.gifToEdit),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const editResponseJson = await editResponse.json();

            const editedGifArray = this.state.gifs.map((gif) => {

                if (gif._id === this.state.editGifId) {

                    gif.url = editResponseJson.data.url;
                    gif.description = editResponseJson.data.description;
                }

                return gif
            });

            this.setState({
                gif: editedGifArray,
                showEdit: false
            });



        } catch (err) {
            console.log(err);
        }

    }
    handleFormChange = (e) => {
        this.setState({
            gifToEdit: {
                ...this.state.gifToEdit,
                [e.target.name]: e.target.value
            },
        })
    }
    openModal = (gif) => {
        this.setState({
            modalIsOpen: true,
            selectedGif: gif
        });
    }

    closeModal = () => {
        this.setState({
            modalIsOpen: false,
            selectedGif: null
        });
    }
    handleTermChange = (e) => {
        this.setState({
            gifSearch: {
                ...this.state.gifSearch,
                [e.target.name]: e.target.value
            }
        })
        const term = e.target.value
        const url = `http://api.giphy.com/v1/gifs/search?q=${term.replace(/\s/g, '+')}&api_key=dc6zaTOxFJmzC&limit=50`;
        request.get(url, (err, res) => {
            this.setState({ gifs: res.body.data })
        });
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <Route exact path="/gifs/my-gifs"
                    render={(props) => { return <MyGifs {...props} gifs={this.state.myGifs} /> }} />
                <Route exact path="/gifs"
                    render={(props) => {
                        return (
                            <div>
                                <CreateGif addGif={this.addGif}
                                    gifSearch={this.state.gifSearch}
                                    handleTermChange={this.handleTermChange}
                                    modalIsOpen={this.state.modalIsOpen}
                                    selectedGif={this.state.selectedGif}
                                    onRequestClose={this.closeModal} />
                                <GifList gifs={this.state.gifs}
                                    deleteGif={this.deleteGif}
                                    showModal={this.showModal}
                                    onGifSelect={selectedGif => this.openModal(selectedGif)} />
                                {this.state.showEdit ? <EditGif closeAndEdit={this.closeAndEdit} handleFormChange={this.handleFormChange} gifToEdit={this.state.gifToEdit} /> : null}
                            </div>
                        )
                    }}
                />
            </div>
        )
    }
}

export default GifsContainer;