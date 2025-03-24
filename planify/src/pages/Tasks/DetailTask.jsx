import React, { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { createTaskAPI, getTaskById } from "../../services/taskService";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Swal from "sweetalert2";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

export default function DetailTask(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [subTasks, setSubTasks] = useState([]);
    const [createBy, setCreateBy] = useState("");
    const [group, setGroup] = useState("");
    useEffect(()=>{
        const fetchData = async ()=>{
            try{
                const token = localStorage.getItem('token');
                const data = await getTaskById(id,token);
                console.log(data.data)
                if (data?.error === "expired") {
                    Swal.fire("Login session expired", "Please log in again.", "error");
                    navigate("/login");
                } else if (data) {
                    setTask(data.data);
                }
                if (data.data.subTasks) {
                    if (Array.isArray(data.data.subTasks)) {
                        setSubTasks(data.data.subTasks);
                    } else {
                        console.error("Invalid task data format", data.subTasks);
                    }
                }
                if (data.data.createByNavigation) {
                    setCreateBy(data.data.createByNavigation);
                }
                if (data.data.group) {
                    setGroup(data.data.group);
                }
            }catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    },[id]);
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
    if (!task) return (<>
    <Header></Header>
    <div style={{ marginTop: '100px' }}>
        Loading... (Some thing wrong! Maybe login time is over or your account cannot access here!)</div>;
    <Footer></Footer></>)
    return(<>
        <Header></Header>
                <div id="task-info-container" className="shadow p-3 mb-5 ms-5 me-5 bg-body-tertiary rounded"
                style={{ marginTop: '100px' }}>
                    <h3 className="fw-bold">{task.taskName}</h3>
                    <div className="d-flex justify-content-between">
                        <div id="left" className="col-7">
                        <table>
                            <tr>
                                <td className="fw-bold">Progress:</td>
                                <td>
                                    <div style={{ width: 50, height: 50 }}>
                                        <CircularProgressbar
                                        value={task.progress * 100}
                                        text={`${Math.round(task.progress * 100)}%`}
                                        styles={buildStyles({
                                            textSize: "30px",
                                            pathColor: `rgba(62, 152, 199, ${task.progress})`,
                                            textColor: "#333",
                                            trailColor: "#d6d6d6",
                                        })}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="fw-bold">Start Time:</td>
                                <td>{formatDate(task.startTime)}</td>
                            </tr>
                            <tr>
                                <td className="fw-bold">Deadline:</td>
                                <td>{formatDate(task.deadline)}</td>
                            </tr>
                            <tr>
                                <td className="pe-3 fw-bold">Amount Budget:</td>
                                <td>{new Intl.NumberFormat('en-US').format(task.amountBudget)} VND</td>
                            </tr>
                        </table>
                        </div>
                        <div id="right" className="col-5">
                        <table>
                            <tr>
                                <td className="fw-bold">Event:</td>
                                <td>{group.eventName}</td>
                            </tr>
                            <tr>
                                <td className="fw-bold">Group:</td>
                                <td>{group.groupName}</td>
                            </tr>
                            <tr>
                                <td className="fw-bold">Created By:</td>
                                <td>{createBy.firstName} {createBy.lastName}</td>
                            </tr>
                            <tr>
                                <td className="pe-3 fw-bold">Creation Date:</td>
                                <td>{formatDate(task.createDate)}</td>
                            </tr>
                            </table>
                        </div>
                    </div>
                    <div>
                        <span className="fw-bold">Description: </span>
                        <div className="border border-1 rounded p-2">{task.taskDescription}</div>
                    </div>
                </div>
                <div id="subtask-list" className="shadow p-3 mb-5 ms-5 me-5 bg-body-tertiary rounded">
                    <h5 className="fw-bold">Sub Task List</h5>
                    <table id="subtask-table" className="table table-stripe">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Start Time</th>
                                <th>Deadline</th>
                                <th>Budget</th>
                                <th>Create By</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            <tr></tr>
                        {subTasks.map((subtask) => (
                            <tr key={subtask.id}>  
                                <td>{subtask.subTaskName}</td>
                                <td>{formatDate(subtask.startTime)}</td> 
                                <td>{formatDate(subtask.deadline)}</td>
                                <td>{subtask.amountBudget}</td>
                                <td>{subtask.createByNavigation.firstName} {subtask.createByNavigation.lastName}</td>
                                
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
        <Footer></Footer>
    </>)
}