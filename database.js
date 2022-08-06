
const libraries = [
  {
    branch: 'downtown'
  },
  {
    branch: 'riverside'
  },
];


const addresses = [
  {
    title: 'downtown',
    address: '1 nowheres ville'
  },
  {
    title: 'riverside',
    address: '1 river rv'
  },
  {
    title: 'J.K. Rowling',
    address: '1 rowling st'
  }
]

// The branch field of a book indicates which library has it in stock
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    branch: 'riverside'
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    branch: 'downtown'
  },
];

const articles = [
  {
    title: 'Harry and the Harriets',
    periodical: 'Witches and Wizards',
    writer: 'J.K. Rowling',
    branch: 'riverside'
  },
  {
    title: 'Harry and the Harriets Pt 2',
    periodical: 'Witches and Wizards',
    writer: 'J.K. Rowling',
    branch: 'riverside'
  }
]

const authors = [
  {
    name: 'J.K. Rowling',
    country: 'Great Britain'
  },
  {
    name: 'Michael Crichton',
    country: 'USA'
  }
]

const a = {
    id: "aId",
    description: "This is an a",
    cOtherId: "999",
}

const b = {
    id: "bId",
    name: "name of b",
    cId: "888"
}

const cs = [
  {
    id: "888",
    description: "instance 888"
  },
  {
    id: "999",
    description: "instance 999"
  },
]


// const addresses = [
//   {
//     title: 'downtown',
//     address: '1 nowheres ville'
//   },

const widgets = [
  {
    id: "111",
    description: "widget 111"
  },
  {
    id: "222",
    description: "widget 222"
  }
]

const extrasWidgetInfo = [
  {
    id: "111",
    description: "widget 111 extras"
  },
  {
    id: "222",
    description: "widget 222 extras"
  }
];



module.exports = {libraries, addresses, books, articles, authors, a, b, cs, widgets, extrasWidgetInfo }
