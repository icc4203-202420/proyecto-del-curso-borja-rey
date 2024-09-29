class Event < ApplicationRecord
  belongs_to :bar
  has_many :attendances
  has_many :users, through: :attendances
  has_many :event_pictures
  has_many :friendships

  has_one_attached :flyer

  def thumbnail
    flyer.variant(resize_to_limit: [200, 200]).processed
  end
end
