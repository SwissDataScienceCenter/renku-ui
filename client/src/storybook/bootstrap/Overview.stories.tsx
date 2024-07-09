import { Meta, StoryObj } from "@storybook/react";

export default {
  parameters: {
    docs: {
      description: {
        component:
          "A bunch of Bootstrap components all combined together to give an overview.",
      },
    },
  },
  title: "Bootstrap/_Overview",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const Overview: Story = {
  render: () => (
    <div>
      <div className="container-fluid">
        {/* <!-- Buttons ================================================== --> */}
        <div className="bs-docs-section">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h2 id="buttons">Buttons</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-8">
              <p className="bs-component">
                <button type="button" className="btn btn-primary">
                  Primary
                </button>{" "}
                <button type="button" className="btn btn-secondary">
                  Secondary
                </button>{" "}
                <button type="button" className="btn btn-success">
                  Success
                </button>{" "}
                <button type="button" className="btn btn-info">
                  Info
                </button>{" "}
                <button type="button" className="btn btn-warning">
                  Warning
                </button>{" "}
                <button type="button" className="btn btn-danger">
                  Danger
                </button>{" "}
                <button type="button" className="btn btn-link">
                  Link
                </button>{" "}
              </p>

              <p className="bs-component">
                <button type="button" className="btn btn-primary disabled">
                  Primary
                </button>{" "}
                <button type="button" className="btn btn-secondary disabled">
                  Secondary
                </button>{" "}
                <button type="button" className="btn btn-success disabled">
                  Success
                </button>{" "}
                <button type="button" className="btn btn-info disabled">
                  Info
                </button>{" "}
                <button type="button" className="btn btn-warning disabled">
                  Warning
                </button>{" "}
                <button type="button" className="btn btn-danger disabled">
                  Danger
                </button>{" "}
                <button type="button" className="btn btn-link disabled">
                  Link
                </button>{" "}
              </p>

              <p className="bs-component">
                <button type="button" className="btn btn-outline-primary">
                  Primary
                </button>{" "}
                <button type="button" className="btn btn-outline-secondary">
                  Secondary
                </button>{" "}
                <button type="button" className="btn btn-outline-success">
                  Success
                </button>{" "}
                <button type="button" className="btn btn-outline-info">
                  Info
                </button>{" "}
                <button type="button" className="btn btn-outline-warning">
                  Warning
                </button>{" "}
                <button type="button" className="btn btn-outline-danger">
                  Danger
                </button>{" "}
              </p>

              <div className="bs-component" style={{ marginBottom: "15px" }}>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-primary">
                    Primary
                  </button>{" "}
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop1"
                      type="button"
                      className="btn btn-primary dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>{" "}
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop1"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-success">
                    Success
                  </button>{" "}
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop2"
                      type="button"
                      className="btn btn-success dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>{" "}
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop2"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-info">
                    Info
                  </button>{" "}
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop3"
                      type="button"
                      className="btn btn-info dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>{" "}
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop3"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button type="button" className="btn btn-danger">
                    Danger
                  </button>{" "}
                  <div className="btn-group" role="group">
                    <button
                      id="btnGroupDrop4"
                      type="button"
                      className="btn btn-danger dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    ></button>{" "}
                    <div
                      className="dropdown-menu"
                      aria-labelledby="btnGroupDrop4"
                    >
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                      <a className="dropdown-item" href="#">
                        Dropdown link
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bs-component" style={{ marginBottom: "15px" }}>
                <button type="button" className="btn btn-primary btn-lg">
                  Large button
                </button>{" "}
                <button type="button" className="btn btn-primary">
                  Default button
                </button>{" "}
                <button type="button" className="btn btn-primary btn-sm">
                  Small button
                </button>{" "}
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component" style={{ marginBottom: "15px" }}>
                <div
                  className="btn-group btn-group-toggle"
                  data-toggle="buttons"
                >
                  <label className="btn btn-primary active">
                    <input type="checkbox" checked={false} /> Active
                  </label>
                  <label className="btn btn-primary">
                    <input type="checkbox" /> Check
                  </label>
                  <label className="btn btn-primary">
                    <input type="checkbox" /> Check
                  </label>
                </div>
              </div>

              <div className="bs-component" style={{ marginBottom: "15px" }}>
                <div
                  className="btn-group btn-group-toggle"
                  data-toggle="buttons"
                >
                  <label className="btn btn-primary active">
                    <input
                      type="radio"
                      name="options"
                      id="option1"
                      checked={false}
                    />{" "}
                    Active
                  </label>
                  <label className="btn btn-primary">
                    <input type="radio" name="options" id="option2" /> Radio
                  </label>
                  <label className="btn btn-primary">
                    <input type="radio" name="options" id="option3" /> Radio
                  </label>
                </div>
              </div>

              <div className="bs-component" style={{ marginBottom: "15px" }}>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Basic example"
                >
                  <button type="button" className="btn btn-secondary">
                    Left
                  </button>{" "}
                  <button type="button" className="btn btn-secondary">
                    Middle
                  </button>{" "}
                  <button type="button" className="btn btn-secondary">
                    Right
                  </button>{" "}
                </div>
              </div>

              <div className="bs-component" style={{ marginBottom: "15px" }}>
                <div
                  className="btn-toolbar"
                  role="toolbar"
                  aria-label="Toolbar with button groups"
                >
                  <div
                    className="btn-group mr-2"
                    role="group"
                    aria-label="First group"
                  >
                    <button type="button" className="btn btn-secondary">
                      1
                    </button>{" "}
                    <button type="button" className="btn btn-secondary">
                      2
                    </button>{" "}
                    <button type="button" className="btn btn-secondary">
                      3
                    </button>{" "}
                    <button type="button" className="btn btn-secondary">
                      4
                    </button>{" "}
                  </div>
                  <div
                    className="btn-group mr-2"
                    role="group"
                    aria-label="Second group"
                  >
                    <button type="button" className="btn btn-secondary">
                      5
                    </button>{" "}
                    <button type="button" className="btn btn-secondary">
                      6
                    </button>{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* // <!-- Navbar ================================================== --> */}
        <div className="bs-docs-section clearfix">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="navbar">Navbars</h2>
              </div>

              <div className="bs-component">
                <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                  <a className="navbar-brand" href="#">
                    Navbar
                  </a>
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarColor01"
                    aria-controls="navbarColor01"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse" id="navbarColor01">
                    <ul className="navbar-nav mr-auto">
                      <li className="nav-item active">
                        <a className="nav-link" href="#">
                          Home <span className="sr-only">(current)</span>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Features
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Pricing
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          About
                        </a>
                      </li>
                    </ul>
                    <form className="form-inline my-2 my-lg-0">
                      <input
                        className="form-control mr-sm-2"
                        type="text"
                        placeholder="Search"
                      />
                      <button
                        className="btn btn-secondary my-2 my-sm-0"
                        type="submit"
                      >
                        Search
                      </button>
                    </form>
                  </div>
                </nav>
              </div>

              <div className="bs-component">
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                  <a className="navbar-brand" href="#">
                    Navbar
                  </a>
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarColor02"
                    aria-controls="navbarColor02"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>{" "}
                  <div className="collapse navbar-collapse" id="navbarColor02">
                    <ul className="navbar-nav mr-auto">
                      <li className="nav-item active">
                        <a className="nav-link" href="#">
                          Home <span className="sr-only">(current)</span>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Features
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Pricing
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          About
                        </a>
                      </li>
                    </ul>
                    <form className="form-inline my-2 my-lg-0">
                      <input
                        className="form-control mr-sm-2"
                        type="text"
                        placeholder="Search"
                      />
                      <button
                        className="btn btn-secondary my-2 my-sm-0"
                        type="submit"
                      >
                        Search
                      </button>{" "}
                    </form>
                  </div>
                </nav>
              </div>

              <div className="bs-component">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                  <a className="navbar-brand" href="#">
                    Navbar
                  </a>
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarColor03"
                    aria-controls="navbarColor03"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>{" "}
                  <div className="collapse navbar-collapse" id="navbarColor03">
                    <ul className="navbar-nav mr-auto">
                      <li className="nav-item active">
                        <a className="nav-link" href="#">
                          Home <span className="sr-only">(current)</span>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Features
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          Pricing
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#">
                          About
                        </a>
                      </li>
                    </ul>
                    <form className="form-inline my-2 my-lg-0">
                      <input
                        className="form-control mr-sm-2"
                        type="text"
                        placeholder="Search"
                      />
                      <button
                        className="btn btn-secondary my-2 my-sm-0"
                        type="submit"
                      >
                        Search
                      </button>{" "}
                    </form>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Typography ================================================== --> */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="typography">Typography</h2>
              </div>
            </div>
          </div>

          {/* <!-- Headings --> */}

          <div className="row">
            <div className="col-sm-4">
              <div className="bs-component">
                <h1>Heading 1</h1>
                <h2>Heading 2</h2>
                <h3>Heading 3</h3>
                <h4>Heading 4</h4>
                <h5>Heading 5</h5>
                <h6>Heading 6</h6>
                <h3>
                  Heading
                  <small className="text-muted">with muted text</small>
                </h3>
                <p className="lead">
                  Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
                  auctor.
                </p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <h2>Example body text</h2>
                <p>
                  Nullam quis risus eget <a href="#">urna mollis ornare</a> vel
                  eu leo. Cum sociis natoque penatibus et magnis dis parturient
                  montes, nascetur ridiculus mus. Nullam id dolor id nibh
                  ultricies vehicula.
                </p>
                <p>
                  <small>
                    This line of text is meant to be treated as fine print.
                  </small>
                </p>
                <p>
                  The following is <strong>rendered as bold text</strong>.
                </p>
                <p>
                  The following is <em>rendered as italicized text</em>.
                </p>
                <p>
                  An abbreviation of the word attribute is{" "}
                  <abbr title="attribute">attr</abbr>.
                </p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <h2>Emphasis classNamees</h2>
                <p className="text-muted">
                  Fusce dapibus, tellus ac cursus commodo, tortor mauris nibh.
                </p>
                <p className="text-primary">
                  Nullam id dolor id nibh ultricies vehicula ut id elit.
                </p>
                <p className="text-secondary">
                  Pellentesque ornare sem lacinia quam venenatis vestibulum.
                </p>
                <p className="text-warning">
                  Etiam porta sem malesuada magna mollis euismod.
                </p>
                <p className="text-danger">
                  Donec ullamcorper nulla non metus auctor fringilla.
                </p>
                <p className="text-success">
                  Duis mollis, est non commodo luctus, nisi erat porttitor
                  ligula.
                </p>
                <p className="text-info">
                  Maecenas sed diam eget risus varius blandit sit amet non
                  magna.
                </p>
              </div>
            </div>
          </div>

          {/* <!-- Block quotes --> */}

          <div className="row">
            <div className="col-sm-12">
              <h2 id="type-block-quotes">Blockquotes</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4">
              <div className="bs-component">
                <blockquote className="blockquote">
                  <p className="mb-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Integer posuere erat a ante.
                  </p>
                  <footer className="blockquote-footer">
                    Someone famous in{" "}
                    <cite title="Source Title">Source Title</cite>
                  </footer>
                </blockquote>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <blockquote className="blockquote text-center">
                  <p className="mb-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Integer posuere erat a ante.
                  </p>
                  <footer className="blockquote-footer">
                    Someone famous in{" "}
                    <cite title="Source Title">Source Title</cite>
                  </footer>
                </blockquote>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <blockquote className="blockquote text-right">
                  <p className="mb-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Integer posuere erat a ante.
                  </p>
                  <footer className="blockquote-footer">
                    Someone famous in{" "}
                    <cite title="Source Title">Source Title</cite>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Tables ================================================== --> */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="tables">Tables</h2>
              </div>

              <div className="bs-component">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Type</th>
                      <th scope="col">Column heading</th>
                      <th scope="col">Column heading</th>
                      <th scope="col">Column heading</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="table-active">
                      <th scope="row">Active</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr>
                      <th scope="row">Default</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-primary">
                      <th scope="row">Primary</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-secondary">
                      <th scope="row">Secondary</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-success">
                      <th scope="row">Success</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-danger">
                      <th scope="row">Danger</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-warning">
                      <th scope="row">Warning</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-info">
                      <th scope="row">Info</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-light">
                      <th scope="row">Light</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                    <tr className="table-dark">
                      <th scope="row">Dark</th>
                      <td>Column content</td>
                      <td>Column content</td>
                      <td>Column content</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Forms ================================================== --> */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="forms">Forms</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <div className="bs-component">
                <form>
                  <fieldset>
                    <legend>Legend</legend>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Email</label>
                      <div className="col-sm-10">
                        <input
                          type="text"
                          className="form-control-plaintext"
                          id="staticEmail"
                          value="email@example.com"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        placeholder="Enter email"
                      />
                      <small id="emailHelp" className="form-text text-muted">
                        We ll never share your email with anyone else.
                      </small>
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="exampleInputPassword1"
                        placeholder="Password"
                      />
                    </div>
                    <div className="form-group">
                      <label>Example select</label>
                      <select className="form-control" id="exampleSelect1">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Example multiple select</label>
                      <select className="form-control" id="exampleSelect2">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Example textarea</label>
                      <textarea
                        className="form-control"
                        id="exampleTextarea"
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>File input</label>
                      <input
                        type="file"
                        className="form-control-file"
                        id="exampleInputFile"
                        aria-describedby="fileHelp"
                      />
                      <small id="fileHelp" className="form-text text-muted">
                        This is some placeholder block-level help text for the
                        above input. It s a bit lighter and easily wraps to a
                        new line.
                      </small>
                    </div>
                    <fieldset className="form-group">
                      <legend>Radio buttons</legend>
                      <div className="form-check">
                        <label className="form-check-label">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="optionsRadios"
                            id="optionsRadios1"
                            value="option1"
                          />
                          Option one is this and that—be sure to include why it
                          s great
                        </label>
                      </div>
                      <div className="form-check">
                        <label className="form-check-label">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="optionsRadios"
                            id="optionsRadios2"
                            value="option2"
                          />
                          Option two can be something else and selecting it will
                          deselect option one
                        </label>
                      </div>
                      <div className="form-check disabled">
                        <label className="form-check-label">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="optionsRadios"
                            id="optionsRadios3"
                            value="option3"
                          />
                          Option three is disabled
                        </label>
                      </div>
                    </fieldset>
                    <fieldset className="form-group">
                      <legend>Checkboxes</legend>
                      <div className="form-check">
                        <label className="form-check-label">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                          />
                          Option one is this and that—be sure to include why it
                          s great
                        </label>
                      </div>
                      <div className="form-check disabled">
                        <label className="form-check-label">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value=""
                          />
                          Option two is disabled
                        </label>
                      </div>
                    </fieldset>
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>{" "}
                  </fieldset>
                </form>
              </div>
            </div>
            <div className="col-sm-4 offset-lg-1">
              <form className="bs-component">
                <div className="form-group">
                  <fieldset>
                    <label className="control-label">Disabled input</label>
                    <input
                      className="form-control"
                      id="disabledInput"
                      type="text"
                      placeholder="Disabled input here..."
                    />
                  </fieldset>
                </div>

                <div className="form-group">
                  <fieldset>
                    <label className="control-label">Readonly input</label>
                    <input
                      className="form-control"
                      id="readOnlyInput"
                      type="text"
                      placeholder="Readonly input here…"
                    />
                  </fieldset>
                </div>

                <div className="form-group has-success">
                  <label className="form-control-label">Valid input</label>
                  <input
                    type="text"
                    value="correct value"
                    className="form-control is-valid"
                    id="inputValid"
                  />
                  <div className="valid-feedback">Success! You ve done it.</div>
                </div>

                <div className="form-group has-danger">
                  <label className="form-control-label">Invalid input</label>
                  <input
                    type="text"
                    value="wrong value"
                    className="form-control is-invalid"
                    id="inputInvalid"
                  />
                  <div className="invalid-feedback">
                    Sorry, that username s taken. Try another?
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-form-label col-form-label-lg">
                    Large input
                  </label>
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder=".form-control-lg"
                    id="inputLarge"
                  />
                </div>

                <div className="form-group">
                  <label className="col-form-label">Default input</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Default input"
                    id="inputDefault"
                  />
                </div>

                <div className="form-group">
                  <label className="col-form-label col-form-label-sm">
                    Small input
                  </label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder=".form-control-sm"
                    id="inputSmall"
                  />
                </div>

                <div className="form-group">
                  <label className="control-label">Input addons</label>
                  <div className="form-group">
                    <div className="input-group mb-3">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        aria-label="Amount (to the nearest dollar)"
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              <div className="bs-component">
                <fieldset>
                  <legend>Custom forms</legend>
                  <div className="form-group">
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="customRadio1"
                        name="customRadio"
                        className="custom-control-input"
                      />
                      <label className="custom-control-label">
                        Toggle this custom radio
                      </label>
                    </div>
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="customRadio2"
                        name="customRadio"
                        className="custom-control-input"
                      />
                      <label className="custom-control-label">
                        Or toggle this other custom radio
                      </label>
                    </div>
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        id="customRadio3"
                        name="customRadio"
                        className="custom-control-input"
                      />
                      <label className="custom-control-label">
                        Disabled custom radio
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customCheck1"
                      />
                      <label className="custom-control-label">
                        Check this custom checkbox
                      </label>
                    </div>
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customCheck2"
                      />
                      <label className="custom-control-label">
                        Disabled custom checkbox
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customSwitch1"
                      />
                      <label className="custom-control-label">
                        Toggle this switch element
                      </label>
                    </div>
                    <div className="custom-control custom-switch">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customSwitch2"
                      />
                      <label className="custom-control-label">
                        Disabled switch element
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <select className="custom-select">
                      <option selected={true}>Open this select menu</option>
                      <option value="1">One</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <div className="input-group mb-3">
                      <div className="custom-file">
                        <input
                          type="file"
                          className="custom-file-input"
                          id="inputGroupFile02"
                        />
                        <label className="custom-file-label">Choose file</label>
                      </div>
                      <div className="input-group-append">
                        <span className="input-group-text" id="">
                          Upload
                        </span>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Nav ================================================== --> */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="nav">Navs</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <h2 id="nav-tabs">Tabs</h2>
              <div className="bs-component">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      data-toggle="tab"
                      href="#home"
                    >
                      Home
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-toggle="tab" href="#profile">
                      Profile
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" href="#">
                      Disabled
                    </a>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      data-toggle="dropdown"
                      href="#"
                      role="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Dropdown
                    </a>
                    <div className="dropdown-menu">
                      <a className="dropdown-item" href="#">
                        Action
                      </a>
                      <a className="dropdown-item" href="#">
                        Another action
                      </a>
                      <a className="dropdown-item" href="#">
                        Something else here
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" href="#">
                        Separated link
                      </a>
                    </div>
                  </li>
                </ul>
                <div id="myTabContent" className="tab-content">
                  <div className="tab-pane fade show active" id="home">
                    <p>
                      Raw denim you probably haven t heard of them jean shorts
                      Austin. Nesciunt tofu stumptown aliqua, retro synth master
                      cleanse. Mustache cliche tempor, williamsburg carles vegan
                      helvetica. Reprehenderit butcher retro keffiyeh
                      dreamcatcher synth. Cosby sweater eu banh mi, qui irure
                      terry richardson ex squid. Aliquip placeat salvia cillum
                      iphone. Seitan aliquip quis cardigan american apparel,
                      butcher voluptate nisi qui.
                    </p>
                  </div>
                  <div className="tab-pane fade" id="profile">
                    <p>
                      Food truck fixie locavore, accusamus mcsweeney s marfa
                      nulla single-origin coffee squid. Exercitation +1 labore
                      velit, blog sartorial PBR leggings next level wes anderson
                      artisan four loko farm-to-table craft beer twee. Qui photo
                      booth letterpress, commodo enim craft beer mlkshk aliquip
                      jean shorts ullamco ad vinyl cillum PBR. Homo nostrud
                      organic, assumenda labore aesthetic magna delectus mollit.
                    </p>
                  </div>
                  <div className="tab-pane fade" id="dropdown1">
                    <p>
                      Etsy mixtape wayfarers, ethical wes anderson tofu before
                      they sold out mcsweeney s organic lomo retro fanny pack
                      lo-fi farm-to-table readymade. Messenger bag gentrify
                      pitchfork tattooed craft beer, iphone skateboard locavore
                      carles etsy salvia banksy hoodie helvetica. DIY synth PBR
                      banksy irony. Leggings gentrify squid 8-bit cred
                      pitchfork.
                    </p>
                  </div>
                  <div className="tab-pane fade" id="dropdown2">
                    <p>
                      Trust fund seitan letterpress, keytar raw denim keffiyeh
                      etsy art party before they sold out master cleanse
                      gluten-free squid scenester freegan cosby sweater. Fanny
                      pack portland seitan DIY, art party locavore wolf cliche
                      high life echo park Austin. Cred vinyl keffiyeh DIY salvia
                      PBR, banh mi before they sold out farm-to-table VHS viral
                      locavore cosby sweater.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <h2 id="nav-pills">Pills</h2>
              <div className="bs-component">
                <ul className="nav nav-pills">
                  <li className="nav-item">
                    <a className="nav-link active" href="#">
                      Active
                    </a>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      data-toggle="dropdown"
                      href="#"
                      role="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Dropdown
                    </a>
                    <div className="dropdown-menu">
                      <a className="dropdown-item" href="#">
                        Action
                      </a>
                      <a className="dropdown-item" href="#">
                        Another action
                      </a>
                      <a className="dropdown-item" href="#">
                        Something else here
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" href="#">
                        Separated link
                      </a>
                    </div>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Link
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" href="#">
                      Disabled
                    </a>
                  </li>
                </ul>
              </div>
              <br />
              <div className="bs-component">
                <ul className="nav nav-pills flex-column">
                  <li className="nav-item">
                    <a className="nav-link active" href="#">
                      Active
                    </a>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      data-toggle="dropdown"
                      href="#"
                      role="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Dropdown
                    </a>
                    <div className="dropdown-menu">
                      <a className="dropdown-item" href="#">
                        Action
                      </a>
                      <a className="dropdown-item" href="#">
                        Another action
                      </a>
                      <a className="dropdown-item" href="#">
                        Something else here
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" href="#">
                        Separated link
                      </a>
                    </div>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      Link
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" href="#">
                      Disabled
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <h2 id="nav-breadcrumbs">Breadcrumbs</h2>
              <div className="bs-component">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item active">Home</li>
                </ol>
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#">Home</a>
                  </li>
                  <li className="breadcrumb-item active">Library</li>
                </ol>
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#">Home</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="#">Library</a>
                  </li>
                  <li className="breadcrumb-item active">Data</li>
                </ol>
              </div>
            </div>

            <div className="col-sm-6">
              <h2 id="pagination">Pagination</h2>
              <div className="bs-component">
                <div>
                  <ul className="pagination">
                    <li className="page-item disabled">
                      <a className="page-link" href="#">
                        «
                      </a>
                    </li>
                    <li className="page-item active">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        4
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        5
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        »
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <ul className="pagination pagination-lg">
                    <li className="page-item disabled">
                      <a className="page-link" href="#">
                        «
                      </a>
                    </li>
                    <li className="page-item active">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        4
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        5
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        »
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <ul className="pagination pagination-sm">
                    <li className="page-item disabled">
                      <a className="page-link" href="#">
                        «
                      </a>
                    </li>
                    <li className="page-item active">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        4
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        5
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        »
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Indicators ================================================== --> */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="indicators">Indicators</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <h2>Alerts</h2>
              <div className="bs-component">
                <div className="alert alert-dismissible alert-warning">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>{" "}
                  <h4 className="alert-heading">Warning!</h4>
                  <p className="mb-0">
                    Best check yo self, you re not looking too good. Nulla vitae
                    elit libero, a pharetra augue. Praesent commodo cursus
                    magna,{" "}
                    <a href="#" className="alert-link">
                      vel scelerisque nisl consectetur et
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="alert alert-dismissible alert-danger">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>{" "}
                  <strong>Oh snap!</strong>{" "}
                  <a href="#" className="alert-link">
                    Change a few things up
                  </a>{" "}
                  and try submitting again.
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="alert alert-dismissible alert-success">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>{" "}
                  <strong>Well done!</strong> You successfully read{" "}
                  <a href="#" className="alert-link">
                    this important alert message
                  </a>
                  .
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="alert alert-dismissible alert-info">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>{" "}
                  <strong>Heads up!</strong> This{" "}
                  <a href="#" className="alert-link">
                    alert needs your attention
                  </a>
                  , but it s not super important.
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="alert alert-dismissible alert-primary">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>{" "}
                  <strong>Oh snap!</strong>{" "}
                  <a href="#" className="alert-link">
                    Change a few things up
                  </a>{" "}
                  and try submitting again.
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="alert alert-dismissible alert-secondary">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>{" "}
                  <strong>Well done!</strong> You successfully read{" "}
                  <a href="#" className="alert-link">
                    this important alert message
                  </a>
                  .
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="alert alert-dismissible alert-light">
                  <button type="button" className="close" data-dismiss="alert">
                    ×
                  </button>{" "}
                  <strong>Heads up!</strong> This{" "}
                  <a href="#" className="alert-link">
                    alert needs your attention
                  </a>
                  , but it s not super important.
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2>Badges</h2>
            <div className="bs-component">
              <span className="badge badge-primary">Primary</span>
              <span className="badge badge-secondary">Secondary</span>
              <span className="badge badge-success">Success</span>
              <span className="badge badge-danger">Danger</span>
              <span className="badge badge-warning">Warning</span>
              <span className="badge badge-info">Info</span>
              <span className="badge badge-light">Light</span>
              <span className="badge badge-dark">Dark</span>
            </div>
            <div className="bs-component">
              <span className="badge badge-pill badge-primary">Primary</span>
              <span className="badge badge-pill badge-secondary">
                Secondary
              </span>
              <span className="badge badge-pill badge-success">Success</span>
              <span className="badge badge-pill badge-danger">Danger</span>
              <span className="badge badge-pill badge-warning">Warning</span>
              <span className="badge badge-pill badge-info">Info</span>
              <span className="badge badge-pill badge-light">Light</span>
              <span className="badge badge-pill badge-dark">Dark</span>
            </div>
          </div>
        </div>

        {/* <!-- Progress ================================================== --> */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="progress">Progress</h2>
              </div>

              <h3 id="progress-basic">Basic</h3>
              <div className="bs-component">
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    aria-valuenow={25}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              <h3 id="progress-alternatives">Contextual alternatives</h3>
              <div className="bs-component">
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: "25%" }}
                    aria-valuenow={25}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: "50%" }}
                    aria-valuenow={50}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: "75%" }}
                    aria-valuenow={75}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{ width: "100%" }}
                    aria-valuenow={100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              <h3 id="progress-multiple">Multiple bars</h3>
              <div className="bs-component">
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: "15%" }}
                    aria-valuenow={15}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: "30%" }}
                    aria-valuenow={30}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: "20%" }}
                    aria-valuenow={20}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              <h3 id="progress-striped">Striped</h3>
              <div className="bs-component">
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped"
                    role="progressbar"
                    style={{ width: "10%" }}
                    aria-valuenow={10}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped bg-success"
                    role="progressbar"
                    style={{ width: "25%" }}
                    aria-valuenow={25}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped bg-info"
                    role="progressbar"
                    style={{ width: "50%" }}
                    aria-valuenow={50}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped bg-warning"
                    role="progressbar"
                    style={{ width: "75%" }}
                    aria-valuenow={75}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped bg-danger"
                    role="progressbar"
                    style={{ width: "100%" }}
                    aria-valuenow={100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>

              <h3 id="progress-animated">Animated</h3>
              <div className="bs-component">
                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: "75%" }}
                    aria-valuenow={75}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Containers ================================================== --> */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="containers">Containers</h2>
              </div>
              <div className="bs-component">
                <div className="jumbotron">
                  <h1 className="display-3">Hello, world!</h1>
                  <p className="lead">
                    This is a simple hero unit, a simple jumbotron-style
                    component for calling extra attention to featured content or
                    information.
                  </p>
                  <hr className="my-4" />
                  <p>
                    It uses utility classNamees for typography and spacing to
                    space content out within the larger container.
                  </p>
                  <p className="lead">
                    <a
                      className="btn btn-primary btn-lg"
                      href="#"
                      role="button"
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <h2>List groups</h2>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-4">
              <div className="bs-component">
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Cras justo odio
                    <span className="badge badge-primary badge-pill">14</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Dapibus ac facilisis in
                    <span className="badge badge-primary badge-pill">2</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Morbi leo risus
                    <span className="badge badge-primary badge-pill">1</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="list-group">
                  <a
                    href="#"
                    className="list-group-item list-group-item-action active"
                  >
                    Cras justo odio
                  </a>
                  <a
                    href="#"
                    className="list-group-item list-group-item-action"
                  >
                    Dapibus ac facilisis in
                  </a>
                  <a
                    href="#"
                    className="list-group-item list-group-item-action disabled"
                  >
                    Morbi leo risus
                  </a>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <div className="list-group">
                  <a
                    href="#"
                    className="list-group-item list-group-item-action flex-column align-items-start active"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">List group item heading</h5>
                      <small>3 days ago</small>
                    </div>
                    <p className="mb-1">
                      Donec id elit non mi porta gravida at eget metus. Maecenas
                      sed diam eget risus varius blandit.
                    </p>
                    <small>Donec id elit non mi porta.</small>
                  </a>
                  <a
                    href="#"
                    className="list-group-item list-group-item-action flex-column align-items-start"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">List group item heading</h5>
                      <small className="text-muted">3 days ago</small>
                    </div>
                    <p className="mb-1">
                      Donec id elit non mi porta gravida at eget metus. Maecenas
                      sed diam eget risus varius blandit.
                    </p>
                    <small className="text-muted">
                      Donec id elit non mi porta.
                    </small>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <h2>Cards</h2>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-4">
              <div className="bs-component">
                <div
                  className="card text-white bg-primary mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Primary card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card text-white bg-secondary mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Secondary card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card text-white bg-success mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Success card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card text-white bg-danger mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Danger card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card text-white bg-warning mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Warning card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card text-white bg-info mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Info card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card bg-light mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Light card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card text-white bg-dark mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Dark card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="bs-component">
                <div
                  className="card border-primary mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Primary card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card border-secondary mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Secondary card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card border-success mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Success card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card border-danger mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Danger card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card border-warning mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Warning card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card border-info mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Info card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card border-light mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Light card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
                <div
                  className="card border-dark mb-3"
                  style={{ maxWidth: "20rem" }}
                >
                  <div className="card-header">Header</div>
                  <div className="card-body">
                    <h4 className="card-title">Dark card title</h4>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-4">
              <div className="bs-component">
                <div className="card mb-3">
                  <h3 className="card-header">Card header</h3>
                  <div className="card-body">
                    <h5 className="card-title">Special title treatment</h5>
                    <h6 className="card-subtitle text-muted">
                      Support card subtitle
                    </h6>
                  </div>
                  {/* eslint-disable */}
                  <img
                    style={{ height: "200px", width: "100%", display: "block" }}
                    src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22318%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20318%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_158bd1d28ef%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A16pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_158bd1d28ef%22%3E%3Crect%20width%3D%22318%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22129.359375%22%20y%3D%2297.35%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E"
                    alt="Card image"
                  />
                  {/* eslint-enable */}
                  <div className="card-body">
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">Cras justo odio</li>
                    <li className="list-group-item">Dapibus ac facilisis in</li>
                    <li className="list-group-item">Vestibulum at eros</li>
                  </ul>
                  <div className="card-body">
                    <a href="#" className="card-link">
                      Card link
                    </a>
                    <a href="#" className="card-link">
                      Another link
                    </a>
                  </div>
                  <div className="card-footer text-muted">2 days ago</div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title">Card title</h4>
                    <h6 className="card-subtitle mb-2 text-muted">
                      Card subtitle
                    </h6>
                    <p className="card-text">
                      Some quick example text to build on the card title and
                      make up the bulk of the cards content.
                    </p>
                    <a href="#" className="card-link">
                      Card link
                    </a>
                    <a href="#" className="card-link">
                      Another link
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog ================================================== */}
        <div className="bs-docs-section">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h2 id="dialog">Dialogs</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <h2>Modals</h2>
              <div className="bs-component">
                <div className="modal">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Modal title</h5>
                        <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">×</span>
                        </button>{" "}
                      </div>
                      <div className="modal-body">
                        <p>Modal body text goes here.</p>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-primary">
                          Save changes
                        </button>{" "}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-dismiss="modal"
                        >
                          Close
                        </button>{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <h2>Popovers</h2>
              <div className="bs-component" style={{ marginBottom: "3em" }}>
                {/* eslint-disable */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  title="Popover Title"
                  data-container="body"
                  data-toggle="popover"
                  data-placement="left"
                  data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus."
                >
                  Left
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-secondary"
                  title="Popover Title"
                  data-container="body"
                  data-toggle="popover"
                  data-placement="top"
                  data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus."
                >
                  Top
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-secondary"
                  title="Popover Title"
                  data-container="body"
                  data-toggle="popover"
                  data-placement="bottom"
                  data-content="Vivamus
                sagittis lacus vel augue laoreet rutrum faucibus."
                >
                  Bottom
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-secondary"
                  title="Popover Title"
                  data-container="body"
                  data-toggle="popover"
                  data-placement="right"
                  data-content="Vivamus sagittis lacus vel augue laoreet rutrum faucibus."
                >
                  Right
                </button>{" "}
                {/* eslint-enable */}
              </div>
              <h2>Tooltips</h2>
              <div className="bs-component">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-toggle="tooltip"
                  data-placement="left"
                  title="Tooltip on left"
                >
                  Left
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Tooltip on top"
                >
                  Top
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title="Tooltip on bottom"
                >
                  Bottom
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-toggle="tooltip"
                  data-placement="right"
                  title="Tooltip on right"
                >
                  Right
                </button>{" "}
              </div>
            </div>
          </div>
        </div>

        <div id="source-modal" className="modal fade">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Source Code</h4>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-hidden="true"
                >
                  ×
                </button>{" "}
              </div>
              <div className="modal-body">
                <pre></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
