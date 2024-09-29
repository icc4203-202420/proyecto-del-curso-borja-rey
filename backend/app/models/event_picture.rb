class EventPicture < ApplicationRecord
  belongs_to :event
  belongs_to :user
  has_many :tags, dependent: :destroy

  has_one_attached :picture

  validates :picture, attached: true, content_type: ['image/png', 'image/jpg', 'image/jpeg']
end
