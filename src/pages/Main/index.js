import React, {Component} from 'react';
import {FaGithubAlt, FaPlus, FaSpinner} from 'react-icons/fa';
import {Link} from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List, TextInput } from './styles';

export default class Main extends Component{

  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false
  };


  componentDidMount(){
    const repositories = localStorage.getItem('repositories');
    if(repositories){
      this.setState({repositories: JSON.parse(repositories)});
    }
  }

  componentDidUpdate(_, prevState){
    const {repositories} = this.state;

    if(prevState.repositories !== repositories){
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({newRepo: e.target.value});
  }

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({loading: true});

    const { newRepo, repositories } = this.state;

    const filtered = repositories.filter(rep => {
      return rep.name === newRepo;
    });

    let response;
    try{
      if(filtered.length > 0) throw new Error('Repositório duplicado');
      response = await api.get(`/repos/${newRepo}`);
    }catch(e){
      console.log(e);
      this.setState({
        error: true,
        loading: false
      });
      return;

    }

    const data = {
      name: response.data.full_name,
    };

    this.setState({
      repositories: [...repositories, data],
      newRepo: '',
      loading: false,
      error: false
    });

    console.log(response.data);
  }

  render(){
    const { newRepo, repositories, loading} = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt/>
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit}>
          <TextInput
            error={this.state.error}
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? <FaSpinner color="#FFF" size={14} /> : <FaPlus color="#FFF" size={14} /> }

          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }

}
