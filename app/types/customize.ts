export interface Topic {
  id: number;
  documentId: string;
  name: string;
}

export interface TopicButtonProps {
  topic: string;
  isSelected: boolean;
  onPress: () => void;
}

export interface TopicsResponse {
  data: Topic[];
  meta?: any;
}

export interface UpdateInterestsRequest {
  data: {
    interests: string[];
  };
}

export interface CustomizeState {
  selectedTopics: Topic[];
  topics: Topic[];
  isLoading: boolean;
  hasError: boolean;
}