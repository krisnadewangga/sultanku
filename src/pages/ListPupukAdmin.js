import Page from 'components/Page';
import ReactDOM from "react-dom"
import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  CustomInput,
} from 'reactstrap';
import {
  MdSearch,
} from 'react-icons/md';
import XLSX from "xlsx"
import * as FileSaver from "file-saver"
import axios from 'axios';


class FormPage extends React.Component {
  componentDidMount() {
    axios.get(`http://localhost:4000/api/pupuk`)
    .then(res => this.setState({pupuk: res.data}))
  }

  state = {
    modal_edit: false,
    modal_export: false,
    pupuk: [],
    filteredData: [],
    selectedData: {},
    value: "",
    fileName: "",
    fileFormat: "xlsx",
    name: "",
    sifat: "",
  };

  toggle = (modalType, selected) => () => {
    console.log(modalType);
    if (!modalType) {
      return this.setState({
        modal_edit: !this.state.modal_edit,
      });
    }

    this.setState({
      [`modal_${modalType}`]: !this.state[`modal_${modalType}`],
      name: "",
      sifat: "",
    });

    if(selected){
      this.setState({selectedData: selected})
    }
  };

  handleFilter = e => {
    let data = this.state.pupuk
    let filteredData = []
    let value = e.target.value
    this.setState({ value })
    if (value.length) {
      filteredData = data.filter(col => {
        let startsWithCondition =
          col.name.toLowerCase().startsWith(value.toLowerCase()) ||
          col.id
            .toString()
            .toLowerCase()
            .startsWith(value.toLowerCase())

        let includesCondition =
          col.name.toLowerCase().includes(value.toLowerCase()) ||
          col.id
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())

        if (startsWithCondition) return startsWithCondition
        else if (!startsWithCondition && includesCondition)
          return includesCondition
        else return null
      })
      this.setState({ value, filteredData })
    }
  }

  toggleExport = () => {
    this.setState({ modal_export: !this.state.modal_export })
  }

  handleExport = () => {
    this.toggle()
    let table = ReactDOM.findDOMNode(this.tableRef)
    let bookType = this.state.fileFormat.length ? this.state.fileFormat : "xlsx"
    let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet JS" })
    let wbout = XLSX.write(wb, { bookType, bookSST: true, type: "binary" })

    const s2ab = s => {
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff
      return buf
    }
    let file =
      this.state.fileFormat.length && this.state.fileFormat.length
        ? `${this.state.fileName}.${this.state.fileFormat}`
        : this.state.fileName.length
        ? `${this.state.fileName}.xlsx`
        : this.state.fileFormat.length
        ? `excel-sheet.${this.state.fileFormat}`
        : "excel-sheet.xlsx"

    return FileSaver.saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      file
    )
  }

  handleSave = (toggle) => {
    axios.put("http://localhost:4000/api/update-pupuk/" + this.state.selectedData.id, {
      name: this.state.selectedData.name,
      sifat: this.state.selectedData.sifat,
    })
    .then(response => {
      toggle()
      axios.get(`http://localhost:4000/api/pupuk`)
      .then(res => this.setState({pupuk: res.data}))
    })
    .catch(response => {
      console.log(response)
    })
  }

  handleDelete = (toggle) => {
    axios.delete("http://localhost:4000/api/delete-pupuk/" + this.state.selectedData.id)
    .then(response => {
      toggle()
      axios.get(`http://localhost:4000/api/pupuk`)
      .then(res => this.setState({pupuk: res.data}))
    })
    .catch(response => {
      console.log(response)
    })
  }

  handleAdd = (toggle) => {
    if(this.state.name === ''){
      alert("Data tidak boleh kosong!")
    } else {
      axios.post("http://localhost:4000/api/add-pupuk", {
        name: this.state.name,
        sifat: this.state.sifat,
      })
      .then(response => {
        toggle()
        console.log(response)
        axios.get(`http://localhost:4000/api/pupuk`)
        .then(res => this.setState({pupuk: res.data}))
      })
      .catch(response => {
        console.log(response)
      })
    }
  }

  handleChange = (e) => {
    this.setState({isAdmin: e.target.value})
  }

  render() {
    let array = this.state.value ? this.state.filteredData : this.state.pupuk
    let renderTableData = array.map((user ,i) => {
      return (
        <tr key={user.id}>
          {console.log(user.image)}
          <th scope="row">{i + 1}</th>
          <td>{user.name}</td>
          <td>{user.sifat}</td>
          {/* <td><img alt={user.name} src={'data:image/png;base64,'+ new Blob(user.image.data)} /></td> */}
          <td>
            <Button type='button' onClick={this.toggle('edit', user)}>Ubah</Button>
            <Button color="danger" type='button' onClick={this.toggle('delete', user)}>Hapus</Button>
          </td>
        </tr>
      )
    })
    return (
      <Page title="List pupuk" breadcrumbs={[{ name: 'Users', active: true }]}>
        <Row>
          <Col>
            <Card>
              <CardHeader className="d-flex flex-wrap justify-content-between mb-1">
                <Label>Pupuk List</Label>
                <div inline className="cr-search-form">
                  <MdSearch
                    size="20"
                    className="cr-search-form__icon-search text-secondary"
                    style={{top: 8}}
                  />
                  <Input
                    type="search"
                    className="cr-search-form__input"
                    value={this.state.value}
                    onChange={e => this.handleFilter(e)}
                    placeholder="Search..."
                  />
                </div>
                <Button onClick={this.toggleExport}>Export as CSV</Button>
              </CardHeader>
              <CardBody>
                <Table innerRef={el => (this.tableRef = el)} responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nama pupuk</th>
                      <th>Sifat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderTableData}
                  </tbody>
                  <tfoot>
                    <Button color="primary" type='button' onClick={this.toggle('add')}>Tambah pupuk</Button>
                  </tfoot>
                </Table>

                <Modal
                  isOpen={this.state.modal_edit}
                  toggle={this.toggle('edit')}
                  className={this.props.className}>
                  <ModalHeader toggle={this.toggle('edit')}>Ubah data</ModalHeader>
                  <ModalBody>
                    <FormGroup>
                      <Label for="exampleEmail">Nama Pupuk</Label>
                      <Input
                        type="text"
                        name="name"
                        defaultValue={this.state.selectedData.name}
                        placeholder="name"
                        onChange={e => this.setState({ selectedData: {...this.state.selectedData, name: e.target.value }})}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="exampleEmail">Sifat Pupuk</Label>
                      <Input
                        type="textarea"
                        name="name"
                        defaultValue={this.state.selectedData.sifat}
                        placeholder="sifat"
                        onChange={e => this.setState({ selectedData: {...this.state.selectedData, sifat: e.target.value }})}
                      />
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter>
                    <Button onClick={() => this.handleSave(this.toggle('edit'))}>
                      Simpan
                    </Button>
                    <Button color="primary" onClick={this.toggle('edit')}>
                      Close
                    </Button>
                  </ModalFooter>
                </Modal>

                <Modal
                  isOpen={this.state.modal_delete}
                  toggle={this.toggle('delete')}
                  className={this.props.className}>
                  <ModalHeader toggle={this.toggle('delete')}>Hapus data</ModalHeader>
                  <ModalBody>
                    Apakah anda yakin untuk menghapus data ini ?
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onClick={() => this.handleDelete(this.toggle('delete'))}>
                      Yes
                    </Button>
                    <Button color="secondary" onClick={this.toggle('delete')}>
                      Close
                    </Button>
                  </ModalFooter>
                </Modal>

                <Modal
                  isOpen={this.state.modal_add}
                  toggle={this.toggle('add')}
                  className={this.props.className}>
                  <ModalHeader toggle={this.toggle('add')}>Tambah data</ModalHeader>
                  <ModalBody>
                    <FormGroup>
                      <Label for="exampleEmail">Nama pupuk</Label>
                      <Input
                        type="text"
                        name="name"
                        defaultValue={this.state.name}
                        placeholder="nama pupuk"
                        onChange={e => this.setState({ name: e.target.value })}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="exampleEmail">Sifat</Label>
                      <Input
                        type="textarea"
                        name="name"
                        defaultValue={this.state.sifat}
                        placeholder="sifat pupuk"
                        onChange={e => this.setState({ sifat: e.target.value })}
                      />
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter>
                    <Button onClick={() => this.handleAdd(this.toggle('add'))}>
                      Simpan
                    </Button>
                    <Button color="primary" onClick={this.toggle('add')}>
                      Close
                    </Button>
                  </ModalFooter>
                </Modal>

                <Modal
                  isOpen={this.state.modal_export}
                  toggle={this.toggleExport}
                  className="modal-dialog-centered">
                  <ModalHeader toggle={this.toggleModal}>Export To Excel</ModalHeader>
                  <ModalBody>
                    <FormGroup>
                      <Input
                        type="text"
                        value={this.state.fileName}
                        onChange={e => this.setState({ fileName: e.target.value })}
                        placeholder="Enter File Name"
                      />
                    </FormGroup>
                    <FormGroup>
                      <CustomInput
                        type="select"
                        id="selectFileFormat"
                        name="customSelect"
                        value={this.state.fileFormat}
                        onChange={e => this.setState({ fileFormat: e.target.value })}>
                        <option>xlsx</option>
                        <option>csv</option>
                        {/* <option>txt</option> */}
                      </CustomInput>
                    </FormGroup>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onClick={this.handleExport}>
                      Export
                    </Button>
                    <Button color="flat-danger" onClick={this.toggleExport}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Page>
    );
  };
};

export default FormPage;
