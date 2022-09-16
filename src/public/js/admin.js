const {
    Form,
    Input,
    Button,
    Card,
    Table,
    Popconfirm,
    Row,
    InputNumber,
    notification,
    Col,
    Modal
} = antd;
const uuidv4 = () => {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};
const EditableContext = React.createContext(null);
const SemrushConfig = () => {
    const [form] = Form.useForm();
    React.useEffect(() => {
        axios.get("/api/semrush/config").then(({ data }) => {
            form.setFieldsValue({
                ...data,
                lid_required: data.lid_required.join(","),
            });
        });
    }, []);
    const onFinish = (v) => {
        axios.post("/api/semrush/setting", JSON.stringify(v), {
            headers: {
                "content-type": "application/json",
            },
        })
        .then(() => {
            notification.success({
                message: "update config successfully",
            });
        })
        .catch((err) => {
            notification.error({
                message: err.toString(),
            });
        });
    };
    return (
        <Card className="semrushConfig" title=" Setting" width={500}>
            <Form onFinish={onFinish} name="semrush" form={form}>
                <Form.Item
                    name="domainOverviewLimit"
                    label="Domain Overview Per Day Limit"
                    rules={[{ required: true, message: "Please input number" }]}
                >
                    <InputNumber type="number" />
                </Form.Item>

                <Form.Item
                    name="keywordOverviewLimit"
                    label="Keyword Overview Per Day Limit"
                    rules={[{ required: true, message: "Please input number" }]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    name="lid_required"
                    label="Lid ID list required"
                    rules={[
                        { required: true, message: "Please input lid, seperate by comma" },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="userAgent"
                    label="User-Agent"
                    rules={[{ required: true, message: "Please input useragent" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="cookie" label="Cookie">
                    <Input />
                </Form.Item>

                <Form.Item
                    name="ahref_keywordExplorerLimit"
                    label="Ahref Keyword Explorer Limit"
                    rules={[{ required: true, message: "Please input number" }]}
                >
                    <InputNumber type="number" />
                </Form.Item>
                <Form.Item
                    name="ahref_siteExplorerLimit"
                    label="Ahref Site Explorer Limit"
                    rules={[{ required: true, message: "Please input number" }]}
                >
                    <InputNumber type="number" />
                </Form.Item>

                <Form.Item
                    name="ahref_batchAnalysisLimit"
                    label="Ahref Batch Analysis Limit"
                    rules={[{ required: true, message: "Please input number" }]}
                >
                    <InputNumber type="number" />
                </Form.Item>
                <Form.Item name="ahref_cookie" label="ahref_cookie">
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        <i className="fa fa-paper-plane" style={{ marginRight: 5 }}></i> Submit
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
const SemrushLogin = () => {
    const onFinish = (v) => {
        axios
            .post("/api/semrush/login", JSON.stringify(v), {
                headers: {
                    "content-type": "application/json",
                },
            })
            .then(() => {
                notification.success({
                    message: "started session successfully",
                });
            })
            .catch((err) => {
                notification.error({
                    message: err.response.data,
                });
            });
    };
    return (
        <Card
            className="semrushConfig"
            title="Semrush Login"
            width={500}
            style={{
                marginTop: 16,
                marginBottom: 16
            }}
        >
            <Form onFinish={onFinish} name="semrush">
                <Form.Item
                    name="email"
                    label="email"
                    rules={[{ required: true, message: "Please input email" }]}
                >
                    <Input type="email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="password"
                    rules={[{ required: true, message: "Please input password" }]}
                >
                    <Input type="password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        <i className='fa fa-paper-plane' style={{ marginRight: 5 }}></i> Submit
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};



const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = React.useState(false);
    const inputRef = React.useRef(null);
    const form = React.useContext(EditableContext);
    React.useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) { }
    };

    const enter = async () => {
        const values = await form.validateFields();
        handleSave({ ...record, ...values });
        toggleEdit();
    };
    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onBlur={save} onPressEnter={enter} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

const WordpressSites = () => {
    const [dataSource, setDataSource] = React.useState([]);
    const [isNewSiteOpen, setIsNewSiteOpen] = React.useState(true);

    const handleDelete = (uuid) => {
        const dts = [...dataSource];
        setDataSource(dts.filter((item) => item.uuid !== uuid));
        axios.delete(`/api/site/${uuid}`);
    };
    const handleSave = (row) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.uuid === item.uuid);
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        let updateBody = { ...item, ...row };
        axios.post("/api/site", JSON.stringify(updateBody), {
            headers: {
                "content-type": "application/json",
            },
        });
        setDataSource(newData);
    };
    const handleNewSiteCancel = () => {

    }

    const handleNewSiteOk = () => {
        const newData = {
            uuid: uuidv4(),
            url: "",
            membershipKey: "",
        };
        setDataSource([...dataSource, newData]);
    };
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    const columnBases = [
        {
            title: "URL",
            dataIndex: "url",
            width: "30%",
            editable: true,
        },

        {
            title: "Membership API Key",
            dataIndex: "membershipApiKey",
            editable: true,
        },
        {
            title: "Actions",
            dataIndex: "Action",
            render: (_, record) =>
                dataSource.length >= 1 ? (
                    <Popconfirm
                        title="Sure to delete?"
                        onConfirm={() => handleDelete(record.uuid)}
                    >
                        <a><i className='fa fa-trash-o' style={{ marginRight: 5 }}></i> Delete</a>
                    </Popconfirm>
                ) : null,
        },
    ];
    const columns = columnBases.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: handleSave,
            }),
        };
    });
    React.useEffect(() => {
        axios.get("/api/sites").then(({ data }) => {
            setDataSource(data);
        });
    }, []);
    return (
        <div>
            <Modal title="Add New Site" open={true} onOk={handleNewSiteOk} onCancel={handleNewSiteCancel}>
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
            <Card
                className="wordpress-site"
                title="Wordpress sites"
                style={{
                    flex: 1,
                    marginTop: 16,
                }}
            >
                
                <Button
                    type="primary"
                    style={{
                        marginBottom: 16,
                    }}
                    onClick={() => setIsNewSiteOpen(!isNewSiteOpen)}>
                    <i className='fa fa-plus' style={{ marginRight: 5 }}></i> Add site
                </Button>
                <Table
                    columns={columns}
                    components={components}
                    dataSource={dataSource}
                    rowClassName={() => "editable-row"}
                    pagination={false}
                />
            </Card>
        </div>
    );
};

const Logs = () => {
    const [dataSource, setDataSource] = React.useState([]);
    React.useEffect(() => {
        axios.get("/api/logs").then(({ data }) => {
            setDataSource(data);
        });
    }, []);
    return (
        <Card
            className="log"
            title="Server Logs"
        >
            <Table
                columns={[
                    {
                        title: "Name",
                        render: (_, r) => {
                            return r;
                        },
                    },
                    {
                        title: "Action",
                        render: (_, r) => {
                            const onOpen = () => {
                                window.open(window.location.origin + "/public/logs/" + r);
                            };
                            return <Button onClick={onOpen}><i className='fa-solid fa-folder-open' style={{ marginRight: 5 }}></i> Open</Button>;
                        },
                    },
                ]}
                pagination={false}
                dataSource={dataSource}
            />
        </Card>
    );
};
const AdminApp = () => {
    return (
        <div style={{ margin: 20 }}>
            <Row gutter={15}>
                <Col xl={7} lg={10} md={24} sm={24} xs={24}>
                    <SemrushConfig />
                    <WordpressSites />
                    <SemrushLogin />
                </Col>
                <Col xl={17} lg={14} md={24} sm={24} xs={24}>
                    <Logs />
                </Col>
            </Row>
        </div>
    )
}
ReactDOM.render(<AdminApp />, document.getElementById('app'));