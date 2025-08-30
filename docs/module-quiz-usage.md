# Module Quiz Usage Guide

This guide shows how to use the `useConcludeModuleQuiz` function to complete module quizzes and update progress.

## Function Signature

```typescript
useConcludeModuleQuiz() => {
  mutateAsync: (params: {
    userCourseId: string;
    moduleId: number;
    grade: number;
    token: string;
  }) => Promise<any>;
  isPending: boolean;
  error: Error | null;
}
```

## Basic Usage

```typescript
import { useConcludeModuleQuiz } from '@/services/catalog';
import { useAuth } from '@/hooks/useAuth';

function QuizComponent() {
  const { token } = useAuth();
  const concludeQuiz = useConcludeModuleQuiz();

  const handleQuizSubmit = async (grade: number) => {
    try {
      await concludeQuiz.mutateAsync({
        userCourseId: 'n3drfwi6kik8855whdh0fp9k', // Your user course ID
        moduleId: 1, // Module ID
        grade: grade, // Quiz grade (e.g., 88)
        token: token,
      });

      console.log('Quiz completed successfully!');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  return (
    // Your quiz UI
  );
}
```

## Integration with Quiz Component

The quiz component (`app/room/quiz.tsx`) has been updated to handle both final test quizzes and module quizzes:

### Parameters for Module Quiz

When navigating to the quiz screen for a module quiz, pass these parameters:

```typescript
router.push({
  pathname: '/room/quiz',
  params: {
    content: JSON.stringify(quiz),
    userCourseId: userCourseId, // User course document ID
    moduleId: moduleId, // Module ID
  },
});
```

### Parameters for Final Test Quiz

For final test quizzes, use these parameters:

```typescript
router.push({
  pathname: '/room/quiz',
  params: {
    content: JSON.stringify(quiz),
    isFinalTest: 'true',
    courseId: courseId, // Course document ID
  },
});
```

## API Endpoint

The function makes a PUT request to:

```
PUT /api/user-courses/{userCourseId}/module/{moduleId}/quiz
```

With the request body:

```json
{
  "data": {
    "grade": 88
  }
}
```

## Error Handling

The function includes proper error handling and will:

- Throw an error if the user course is not found
- Handle network errors gracefully
- Invalidate relevant queries to refresh data after successful completion

## Loading States

You can check the loading state using:

```typescript
const concludeQuiz = useConcludeModuleQuiz();

if (concludeQuiz.isPending) {
  // Show loading indicator
}
```

## Query Invalidation

After successful completion, the function automatically invalidates:

- `['user-courses']` - User courses list
- `['user-courses', 'in-progress']` - In-progress courses

This ensures that the UI updates with the latest progress data.
