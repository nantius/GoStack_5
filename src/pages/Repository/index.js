import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FaAngleLeft, FaAngleRight} from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';
import {Loading, Owner, IssueList, IssueFilter, IssueHeader} from './styles';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    repo: '',
    page: 1,
    filter: 'open'
  }

  async componentDidMount(){
    const {match} = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: this.state.filter,
          page: this.state.page
          // per_page: 5,
        }
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      repo: repoName,
    });


  }

  handlePageSubmit = async (e, newPage) => {
    e.preventDefault();

    const {page, filter, repo} = this.state;

      this.setState({
        loading: true
      })

      const issues = await api.get(`/repos/${repo}/issues`, {
        params: {
          state: filter,
          page: page+newPage
        }
      });

      this.setState({
        issues: issues.data,
        loading: false,
        filter,
        page: page+newPage
      });
  }

  handleFilterSubmit = async (e, filter) => {
    e.preventDefault();

    this.setState({
      loading: true
    })

    const issues = await api.get(`/repos/${this.state.repo}/issues`, {
      params: {
        state: filter,
        page: this.state.page
      }
    });

    this.setState({
      issues: issues.data,
      loading: false,
      filter
    });

  }

  render(){
    const {repository, issues, loading, page} = this.state;

    if(loading){
      return <Loading>Carregando</Loading>;
    }

    return (
        <Container>
          <Owner>
            <Link to="/">Voltar aos repositórios</Link>
            <img src={repository.owner.avatar_url} alt={repository.owner.login} />
            <h1>{repository.name}</h1>
            <p>{repository.description}</p>
          </Owner>

          <IssueList>
            <IssueHeader page={page}>
              <IssueFilter>
                <a onClick={(e) => this.handleFilterSubmit(e, 'all')}>All</a>
                <a onClick={(e) => this.handleFilterSubmit(e, 'open')}>Open</a>
                <a onClick={(e) => this.handleFilterSubmit(e, 'closed')}>Closed</a>
              </IssueFilter>
              <div>
                {
                  page == 1
                  ? (<button disabled><FaAngleLeft/></button>)
                  : (<button onClick={(e) => this.handlePageSubmit(e, -1)}><FaAngleLeft/></button>)
                }
                <button onClick={(e) => this.handlePageSubmit(e, +1)}><FaAngleRight/></button>
              </div>
            </IssueHeader>

            {issues.map(issue => (
              <li key={String(issue.id)}>
                <img src={issue.user.avatar_url} alt={issue.user.login} />
                <div>
                  <strong>
                    <a href={issue.html_url}>{issue.title}</a>
                    {issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  </strong>
                  <p>{issue.user.login}</p>
                </div>
              </li>
            ))}
          </IssueList>
        </Container>
      );
  }
}
