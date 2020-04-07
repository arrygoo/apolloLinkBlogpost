import gql from "graphql-tag";

export const BOOKS_QUERY = gql`
  query books {
    books {
      title
      author
    }
  }
`;

export const USER_QUERY = gql`
  query user {
    user {
      id
      name
      planetId
    }
  }
`;

export const PLANET_QUERY = gql`
  query planet($planetId: ID!) {
    planet(planetId: $planetId) {
      id
      name
    }
  }
`;
