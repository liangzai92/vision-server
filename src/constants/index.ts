export enum TreeNodeTypes {
  REGULAR_FILE, // -
  DIRECTORY, // d
  SYMBOLIC_LINK, //  l
}

export enum ItemTypes {
  PROJECT = 'project',
  TEMPLATE = 'template',
  PROJECT_CREATED_FROM_TEMPLATE = 'projectCreatedFromTemplate',
}

export const ACCESS_TOKEN_COOKIE_NAME = 'fe_vision_access_token';
