const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Task = require('../src/models/Task');

beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb_test';
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Task.deleteMany(); // Clear tasks before each test
});

describe('Task API', () => {
  it('should create and retrieve a task', async () => {
    const resPost = await request(app).post('/api/tasks').send({
      title: "Test Task",
      description: "Testing..."
    });
    expect(resPost.statusCode).toBe(201);
    expect(resPost.body.title).toBe("Test Task");

    const resGet = await request(app).get('/api/tasks');
    expect(resGet.body.length).toBe(1);
    expect(resGet.body[0].title).toBe("Test Task");
  });

  it('should delete a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: "Delete Me", description: "To be deleted" });
    const taskId = res.body._id;

    const resDelete = await request(app).delete('/api/tasks/' + taskId);
    expect(resDelete.statusCode).toBe(204);

    const resAfter = await request(app).get('/api/tasks');
    expect(resAfter.body.length).toBe(0);
  });

  it('should update (pin/unpin) a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: "Pin Me", description: "Initially unpinned" });
    const taskId = res.body._id;

    const resPatch = await request(app).patch('/api/tasks/' + taskId).send({ pinned: true });
    expect(resPatch.statusCode).toBe(200);
    expect(resPatch.body.pinned).toBe(true);

    const resUnpin = await request(app).patch('/api/tasks/' + taskId).send({ pinned: false });
    expect(resUnpin.body.pinned).toBe(false);
  });

  it('should fail on missing title or description', async () => {
    const res = await request(app).post('/api/tasks').send({ title: "", description: "" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
