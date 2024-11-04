class API::V1::EventPicturesController < ApplicationController
  include ImageProcessing

  respond_to :json
  before_action :set_event_picture, only: [:show, :update, :destroy]

  def index
    @event_pictures = EventPicture.all
    @picture_urls = @event_pictures.map { |picture| url_for(picture.picture) }
    render json: @event_pictures.map { |picture| picture.as_json.merge(picture_url: url_for(picture.picture)) }, status: :ok
  end

  def show
    if @event_picture.picture.attached?
      render json: {
        event_picture: @event_picture.as_json.merge({
          picture_url: url_for(@event_picture.picture)
        }),
        tags: @event_picture.tags.as_json(include: [:tagged_by, :tagged_user]),
        user: @event_picture.user
      }, status: :ok
    else
      render json: {
        event_picture: @event_picture.as_json,
        tags: @event_picture.tags,
        user: @event_picture.user
      }, status: :ok
    end
  end

  def create
    @event_picture = EventPicture.new(event_picture_params.except(:image_base64))
    handle_image_attachment if event_picture_params[:image_base64]

    if @event_picture.save
      render json: { event_picture: @event_picture, message: 'Event created successfully.' }, status: :ok
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end

  def update
    handle_image_attachment if event_picture_params[:image_base64]

    if @event_picture.update(event_picture_params.except(:image_base64))
      render json: { event_picture: @event_picture, message: 'Event updated successfully.' }, status: :ok
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @event_picture.destroy
      render json: { message: 'Event Picture successfully deleted.' }, status: :no_content
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end
end