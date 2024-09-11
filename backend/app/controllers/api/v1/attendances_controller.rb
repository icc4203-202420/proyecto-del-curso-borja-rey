class API::V1::AttendancesController < ApplicationController
  respond_to :json
  before_action :set_event, only: [:create]
  before_action :set_user, only: [:create]
  before_action :set_attendance, only: [:show, :update, :destroy]

  # GET /attendances
  def index
    @attendances = Attendance.includes(:user).all
    render json: {
      attendances: @attendances.map { |attendance|
        {
          id: attendance.id,
          event_id: attendance.event_id,
          check_in: attendance.check_in,
          user: {
            id: attendance.user.id,
            name: attendance.user.handle,
            email: attendance.user.email,
            first_name: attendance.user.first_name,
            last_name: attendance.user.last_name
          }
        }
      }
    }, status: :ok
  end

  # GET /attendances/:id
  def show
    if @attendance
      render json: {
        attendance: {
          id: @attendance.id,
          event_id: @attendance.event_id,
          check_in: @attendance.check_in,
          user: {
            id: @attendance.user.id,
            name: @attendance.user.handle,
            email: @attendance.user.email,
            first_name: @attendance.user.first_name,
            last_name: @attendance.user.last_name
          }
        }
      }, status: :ok
    else
      render json: { error: "Attendance not found" }, status: :not_found
    end
  end

  # POST /attendances
  def create
    @attendance = @user.attendances.new(attendance_params)
    @user_attendance = Attendance.where(user: @user, event: @event)
    if @user_attendance.exists?
      render json: { error: "User already is attending this event" }, status: :unprocessable_entity
    else
      if @attendance.save
        render json: @attendance, status: :created, location: api_v1_attendance_url(@attendance)
      else
        render json: @attendance.errors, status: :unprocessable_entity
      end
    end
  end

  # PATCH/PUT /attendances/:id
  def update
    if @attendance.update(attendance_params)
      render json: @attendance
    else
      render json: @attendance.errors, status: :unprocessable_entity
    end
  end

  # DELETE /attendances/:id
  def destroy
    @attendance.destroy
    head :no_content
  end

  private

  def set_attendance
    @attendance = Attendance.find(params[:id])
  end

  def set_user
    @user = User.find(params[:attendance][:user_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def set_event
    @event = Event.find(params[:attendance][:event_id])
  end

  def attendance_params
    params.require(:attendance).permit(:user_id, :event_id, :check_in, :default, :false)
  end
end
