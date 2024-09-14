class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  def index
    @events = Event.includes(:bar).all
    render json: {
      events: @events.map { |event|
        event.as_json.merge({
          bar_name: event.bar.name
        })
      }
    }, status: :ok
  end

  # GET /events/:id
  def show
    if @event.flyer.attached?
      render json: @event.as_json.merge({
        image_url: url_for(@event.flyer),
        thumbnail_url: url_for(@event.thumbnail),
        bar_name: @event.bar.name
      }), status: :ok
    else
      render json: @event.as_json.merge({
        bar_name: @event.bar.name
      }), status: :ok
    end
  end

  def create
    @event = Event.new(event_params.except(:image_base64))
    handle_image_attachment if event_params[:image_base64]

    if @event.save
      render json: { event: @event, message: 'Event created successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def update
    handle_image_attachment if event_params[:image_base64]

    if @event.update(event_params.except(:image_base64))
      render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @event.destroy
      render json: { message: 'Event successfully deleted.' }, status: :no_content
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def attendances
    @event = Event.find(params[:id])
    @attendances = @event.attendances.includes(:user)  # Incluir la relación con los usuarios

    render json: {
      attendances: @attendances.map { |attendance|
        attendance.as_json.merge({
          user: {
            id: attendance.user.id,
            name: attendance.user.handle,
            first_name: attendance.user.first_name,
            last_name: attendance.user.last_name
            # Agrega otros atributos del usuario que quieras incluir
          }
        })
      }
    }, status: :ok
  end

  private

  def set_event
    @event = Event.find_by(id: params[:id])
    render json: { error: 'Event not found' }, status: :not_found unless @event
  end

  def event_params
    params.require(:event).permit(:name, :description, :date, :bar_id, :start_date, :end_date, :image_base64)
  end

  def handle_image_attachment
    decoded_image = decode_image(event_params[:image_base64])
    @event.flyer.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
  end
end
