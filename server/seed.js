const mongoose = require('mongoose');

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:');
    console.log('✅ Connected to MongoDB');

    const User = require('./src/models/User').default;

    const users = await User.insertMany([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Coffee enthusiast and tech lover ☕️',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'Designer | Photographer | Dreamer',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      {
        username: 'alex_dev',
        email: 'alex@example.com',
        password: 'password123',
        bio: 'Full-stack developer 🚀',
        avatar: 'https://i.pravatar.cc/150?img=3'
      }
    ]);

    console.log(`✅ Created ${users.length} sample users`);

    users[0].followers.push(users[1]._id);
    users[0].following.push(users[2]._id);
    users[1].following.push(users[0]._id);
    users[2].following.push(users[0]._id, users[1]._id);

    await users[0].save();
    await users[1].save();
    await users[2].save();

    console.log('✅ Created follow relationships');

    const Post = require('./src/models/Post').default;

    const posts = await Post.insertMany([
      {
        author: users[0]._id,
        text: 'Just launched my new portfolio! Check it out and let me know what you think 🎉',
        image: '',
        visibility: 'public'
      },
      {
        author: users[1]._id,
        text: 'Beautiful sunset today at the beach 🌅',
        image: '',
        visibility: 'public'
      },
      {
        author: users[2]._id,
        text: 'Working on an exciting new project with React and Node.js!',
        image: '',
        visibility: 'public'
      }
    ]);

    console.log(`✅ Created ${posts.length} sample posts`);

    users[0].posts.push(posts[0]._id);
    users[1].posts.push(posts[1]._id);
    users[2].posts.push(posts[2]._id);

    await users[0].save();
    await users[1].save();
    await users[2].save();

    console.log('✅ Database seeding completed!');
    console.log('\nTest Credentials:');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');
    console.log('User 3: alex@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

seedDatabase();

