import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, message, Popconfirm, Spin, Checkbox } from "antd";
import ButtonsComponent from "@components/button-component";
import TableComponent from "@components/table-component";
import {
  fetchListIntern,
  addIntern,
  updateIntern,
  deleteIntern,
  fetchListInternship,
  fetchListSchool,
} from "@redux/features/internSlice";
import { formatDateDisplay } from "@utils/dateFormat.js";
import DeleteConfirmModal from "./components/modals/DeleteConfirmModal";
import InternForm from "./components/modals/InternForm";
import InternDetailModal from "./components/modals/InternDetailModal"; // NEW

const InternManagement = () => {
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [viewData, setViewData] = useState(null); // NEW
  const [isViewModalVisible, setIsViewModalVisible] = useState(false); // NEW

  const { listIntern, listInternship, listSchool, totalIntern, status } =
    useSelector((state) => state.intern);

  // Fetch list of interns
  const getListIntern = async () => {
    await dispatch(fetchListIntern({ pageNumber: 1, pageSize: 10 }));
  };

  useEffect(() => {
    getListIntern();
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchListInternship());
    dispatch(fetchListSchool());
  }, [dispatch]);

  // Add row
  const handleAdd = () => {
    setIsModalVisible(true);
    setEditData(null);
  };

  // Editable when click 1 row
  const handleEdit = () => {
    if (selectedRowKeys.length !== 1) {
      message.warning("Vui lòng chọn một hàng cần sửa");
      return;
    }
    const editItem = listIntern.find((item) => item.id === selectedRowKeys[0]);
    setIsModalVisible(true);
    setEditData(editItem);
  };

  // Delete 1 row
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await dispatch(deleteIntern(id)).unwrap();
      getListIntern();
      setSelectedRowKeys([]);
      message.success("Xóa thành công");
    } catch (error) {
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
    }
  };

  // Add or edit row
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editData) {
        await dispatch(
          updateIntern({ id: editData.id, data: values })
        ).unwrap();
        message.success("Cập nhật thành công");
      } else {
        await dispatch(addIntern(values)).unwrap();
        message.success("Thêm mới thành công");
      }

      getListIntern();
      setIsModalVisible(false);
      setSelectedRowKeys([]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // View intern details
  const handleView = (intern) => {
    setViewData(intern); // Store selected intern data for viewing
    setIsViewModalVisible(true); // Open the modal
  };

  // Handle Edit from InternDetailModal
  const handleEditFromDetail = () => {
    setIsViewModalVisible(false); // Close detail modal
    setIsModalVisible(true); // Open InternForm modal
    setEditData(viewData); // Prefill InternForm with selected intern data
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewData(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRowKeys([]);
  };

  const handleResetTable = () => {
    setSelectedRowKeys([]);
    setIsSelectAll(false);
    getListIntern();
  };

  const handleSelectAll = (e) => {
    const allKeys = listIntern.map((item) => item.id);
    if (e.target.checked) {
      setSelectedRowKeys(allKeys);
    } else {
      setSelectedRowKeys([]);
    }
    setIsSelectAll(e.target.checked);
  };

  const dataSource = listIntern.map((item, index) => ({
    id: item.id,
    key: item.id,
    group: item.group,
    fullName: item.firstName + " " + item.lastName,
    dob: formatDateDisplay(item.birthday),
    phoneNumber: item.phoneNumber,
    position: item.desiredPosition,
    school: item.school?.name,
    email: item.personalEmail,
    cv: item.linkCv,
    comments: "",
    role: item.role,
    project: "",
    mentor: "",
    status: item.status,
    reportProcess: "",
    stt: index + 1,
  }));

  const columns = [
    { title: "STT", dataIndex: "stt", key: "stt" },
    { title: "Nhóm", dataIndex: "group", key: "group" },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
    { title: "Ngày sinh", dataIndex: "dob", key: "dob" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Vị trí", dataIndex: "position", key: "position" },
    { title: "Trường", dataIndex: "school", key: "school" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "CV",
      dataIndex: "cv",
      key: "cv",
      render: (text) => <a href={text}>Link</a>,
    },
    { title: "Đánh giá", dataIndex: "comments", key: "comments" },
    { title: "Vai trò", dataIndex: "role", key: "role" },
    { title: "Dự án", dataIndex: "project", key: "project" },
    { title: "Mentor", dataIndex: "mentor", key: "mentor" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Xem",
      key: "view",
      render: (_, record) => (
        <Button onClick={() => handleView(record)} type="primary">
         Xem
        </Button>
      ),
    },
  ];

  const rowSelection = {
    type: "checkbox",
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
  };

  const buttons = [
    {
      label: "Làm Mới",
      type: "primary",
      icon: <ReloadOutlined />,
      style: { background: "green", color: "white" },
      onClick: handleResetTable,
    },
    {
      label: "Thêm mới",
      type: "primary",
      icon: <PlusOutlined />,
      onClick: handleAdd,
    },
    {
      label: "Sửa",
      icon: <EditOutlined />,
      onClick: handleEdit,
      disabled: selectedRowKeys.length !== 1, // enable only when select 1 row
    },
    {
      render: () => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa không?"
          onConfirm={() => handleDelete(selectedRowKeys[0])}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button
            key="delete"
            type="default"
            danger
            icon={<DeleteOutlined />}
            loading={loading}
            disabled={selectedRowKeys.length === 0 || loading} // disable when no row is selected
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Spin spinning={loading}>
        <div style={{ marginBottom: 16 }}>
          <Checkbox checked={isSelectAll} onChange={handleSelectAll}>
            Chọn tất cả
          </Checkbox>
        </div>
        <TableComponent
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          rowKey="id"
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          selectionType="checkbox"
        />
      </Spin>

      <div
        style={{
          position: "fixed",
          bottom: 50,
          zIndex: 1000,
        }}
      >
        <ButtonsComponent buttons={buttons} />
      </div>


      <InternForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        editData={editData}
        listInternship={listInternship}
        listSchool={listSchool}
        confirmLoading={loading}
      />


      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        onCancel={handleCancel}
        onConfirm={() => handleDelete(selectedRowKeys[0])}
      />


      <InternDetailModal
        visible={isViewModalVisible}
        onCancel={handleViewCancel}
        internData={viewData}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
};

export default InternManagement;
