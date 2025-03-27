import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import '../../styles/Events/EventPlan.css'

export default function EventPlan() {
  const [project, setProject] = useState('');
  const [date, setDate] = useState('');
  const [goals, setGoals] = useState('');
  const [measures, setMeasures] = useState('');
  const [scope, setScope] = useState('');
  const [staffing, setStaffing] = useState('');
  const [tracking, setTracking] = useState('');
  const [risks, setRisks] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [actionItems, setActionItems] = useState([
    { id: 1, owner: '', dueDate: '', activities: '', deliverables: '', resources: '' },
  ]);

  const handleActionChange = (index, field, value) => {
    const updated = [...actionItems];
    updated[index][field] = value;
    setActionItems(updated);
  };

  const addActionItem = () => {
    setActionItems([
      ...actionItems,
      { id: actionItems.length + 1, owner: '', dueDate: '', activities: '', deliverables: '', resources: '' },
    ]);
  };

  return (
    <Container className="mt-4">
      <h2 className="fw-bold mb-4">Action Plan for Requirements Process Improvement</h2>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Project</Form.Label>
          <Form.Control value={project} onChange={(e) => setProject(e.target.value)} />
        </Col>
        <Col md={6}>
          <Form.Label>Date</Form.Label>
          <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label>Goals</Form.Label>
        <Form.Control as="textarea" rows={2} value={goals} onChange={(e) => setGoals(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Measures of Success</Form.Label>
        <Form.Control as="textarea" rows={2} value={measures} onChange={(e) => setMeasures(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Scope of Organizational Impact</Form.Label>
        <Form.Control as="textarea" rows={2} value={scope} onChange={(e) => setScope(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Staffing and Participants</Form.Label>
        <Form.Control as="textarea" rows={2} value={staffing} onChange={(e) => setStaffing(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Tracking and Reporting Process</Form.Label>
        <Form.Control as="textarea" rows={2} value={tracking} onChange={(e) => setTracking(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Dependencies, Risks, and Barriers</Form.Label>
        <Form.Control as="textarea" rows={2} value={risks} onChange={(e) => setRisks(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estimated Completion Date for All Activities</Form.Label>
        <Form.Control type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
      </Form.Group>

      <h4 className="fw-bold mt-5 mb-3">Action Items</h4>
      <Table bordered responsive>
        <thead>
          <tr>
            <th>Action Item</th>
            <th>Owner</th>
            <th>Due Date</th>
            <th>Activities</th>
            <th>Deliverables</th>
            <th>Resources Needed</th>
          </tr>
        </thead>
        <tbody>
          {actionItems.map((item, idx) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td><Form.Control value={item.owner} onChange={(e) => handleActionChange(idx, 'owner', e.target.value)} /></td>
              <td><Form.Control type="date" value={item.dueDate} onChange={(e) => handleActionChange(idx, 'dueDate', e.target.value)} /></td>
              <td><Form.Control value={item.activities} onChange={(e) => handleActionChange(idx, 'activities', e.target.value)} /></td>
              <td><Form.Control value={item.deliverables} onChange={(e) => handleActionChange(idx, 'deliverables', e.target.value)} /></td>
              <td><Form.Control value={item.resources} onChange={(e) => handleActionChange(idx, 'resources', e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="secondary" onClick={addActionItem}>+ Thêm dòng</Button>
    </Container>
  );
}
