import Handlebars from 'handlebars';

export const renderTemplate = () => {
  const source = '';
  const template = Handlebars.compile(source);

  const data = {
    name: 'Alan',
    hometown: 'Somewhere, TX',
    kids: [
      { name: 'Jimmy', age: '12' },
      { name: 'Sally', age: '4' },
    ],
  };

  const result = template(data);
  return result;
};
