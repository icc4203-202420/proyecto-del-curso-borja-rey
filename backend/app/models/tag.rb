class Tag < ApplicationRecord
  belongs_to :event_picture
  belongs_to :tagged_user, class_name: 'User'
  belongs_to :tagged_by, class_name: 'User'
end
